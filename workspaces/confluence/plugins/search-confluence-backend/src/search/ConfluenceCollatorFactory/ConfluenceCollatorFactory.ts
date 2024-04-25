import { Config } from '@backstage/config';
import {
  DocumentCollatorFactory,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import pLimit from 'p-limit';
import { Readable } from 'stream';
import { Logger } from 'winston';
import {
  ConfluenceDocument,
  ConfluenceDocumentList,
  IndexableAncestorRef,
  IndexableConfluenceDocument,
  ConfluenceInstanceConfig,
} from './types';
import { v4 as uuidv4 } from 'uuid';

type ConfluenceCollatorOptions = {
  logger: Logger;

  parallelismLimit: number;

  wikiUrl: string;
  auth: {
    username?: string;
    password?: string;
    token?: string;
  };
  category: string[];
};

export const confluenceDefaultSchedule = {
  frequency: { minutes: 180 },
  timeout: { minutes: 60 },
  initialDelay: { seconds: 30 },
};

export interface UserEntityDocument extends IndexableDocument {
  kind: string;
  login: string;
  email: string;
}

export class ConfluenceCollatorFactory implements DocumentCollatorFactory {
  public readonly type: string = 'confluence';

  private logger: Logger;

  private parallelismLimit: number;
  private wikiUrl: string;
  private auth: { username?: string; password?: string; token?: string };
  public category: string[];
  static fromConfig(
    config: Config,
    options: {
      logger: Logger;
      parallelismLimit?: number;
    },
  ) {
    const confluenceOptions =
      config.get<ConfluenceInstanceConfig>('confluence');

    const auth = confluenceOptions.auth.token
      ? { token: confluenceOptions.auth.token }
      : {
          username: confluenceOptions.auth.username,
          password: confluenceOptions.auth.password,
        };

    return new ConfluenceCollatorFactory({
      logger: options.logger,
      parallelismLimit: options.parallelismLimit ?? 15,
      wikiUrl: confluenceOptions.wikiUrl,
      auth: auth,
      category: confluenceOptions.category,
    });
  }

  private constructor(options: ConfluenceCollatorOptions) {
    this.logger = options.logger;

    this.parallelismLimit = options.parallelismLimit;
    this.wikiUrl = options.wikiUrl;
    this.auth = options.auth;
    this.category = options.category;
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  public async *execute(): AsyncGenerator<IndexableConfluenceDocument> {
    const spacesList = await this.getSpaces();
    const documentsList = await this.getDocumentsFromSpaces(spacesList);
    const limit = pLimit(this.parallelismLimit);
    const documentsInfo = documentsList.map(documentUrl =>
      limit(async () => {
        try {
          return await this.getDocumentInfo(documentUrl);
        } catch (err) {
          this.logger.warn(
            `error while indexing document "${documentUrl}"`,
            err,
          );
        }

        return [];
      }),
    );

    const safePromises = documentsInfo.map(promise =>
      promise.catch(error => {
        this.logger.warn(error);

        return [];
      }),
    );

    const documents = (await Promise.all(safePromises)).flat();

    for (const document of documents) {
      yield document;
    }
  }

  async getSpaces(): Promise<string[]> {
    let spacekeys: string[] = [];
    const spacesWithLabel = await this.getSpacesByLabel();
    const categoryList = this.category;
    categoryList.forEach(key => {
      const values = spacesWithLabel[key];

      if (values) {
        spacekeys = [...spacekeys, ...values];
      }
    });
    this.logger.warn(
      `spaces to fetch from categoryList: ${JSON.stringify(spacekeys)}`,
    );
    const sortedSpaceKeys = await this.sortSpaceByLastModified(spacekeys);
    return sortedSpaceKeys;
  }

  async getSpacesByLabel(): Promise<{ [key: string]: string[] }> {
    const spacesByLabel: { [key: string]: string[] } = {};
    let next = true;
    let requestUrl = `${this.wikiUrl}/rest/api/space?expand=description.view,metadata.labels`;
    while (next) {
      const data = await this.get<any>(requestUrl);
      if (!data.results) {
        break;
      }
      for (const result of data.results) {
        const labels = result.metadata.labels.results.map(
          (label: { name: any }) => label.name,
        );
        for (const label of labels) {
          if (!spacesByLabel[label]) {
            spacesByLabel[label] = [];
          }
          spacesByLabel[label].push(result.key);
        }
      }
      if (data._links.next) {
        requestUrl = `${this.wikiUrl}${data._links.next}`;
      } else {
        next = false;
      }
    }
    return spacesByLabel;
  }
  async sortSpaceByLastModified(spaceKeys: string[]): Promise<string[]> {
    const spaceKeysWithDates = [];

    for (const spaceKey of spaceKeys) {
      const searchUrl = `${this.wikiUrl}/rest/api/search?cql=space.key=${spaceKey}`;
      try {
        const searchData = await this.get<any>(searchUrl);
        const lastModified = new Date(searchData.results[0].lastModified);
        spaceKeysWithDates.push({ key: spaceKey, lastModified });
      } catch (error) {
        this.logger.warn(
          `Failed to fetch data for space key ${spaceKey}:`,
          error,
        );
      }
    }

    spaceKeysWithDates.sort(
      (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
    );

    return spaceKeysWithDates.map(space => space.key);
  }

  async getDocumentsFromSpaces(spaces: string[]): Promise<string[]> {
    const documentsList = [];

    for (const space of spaces) {
      documentsList.push(...(await this.getDocumentsFromSpace(space)));
    }

    return documentsList;
  }

  async getDocumentsFromSpace(space: string): Promise<string[]> {
    const documentsList = [];

    this.logger.warn(`exploring space ${space}`);

    let next = true;
    let requestUrl = `${this.wikiUrl}/rest/api/content?limit=500&status=current&spaceKey=${space}`;
    while (next) {
      const data = await this.get<ConfluenceDocumentList>(requestUrl);
      if (!data.results) {
        break;
      }

      documentsList.push(...data.results.map(result => result._links.self));

      if (data._links.next) {
        requestUrl = `${this.wikiUrl}${data._links.next}`;
      } else {
        next = false;
      }
    }

    return documentsList;
  }

  async getDocumentInfo(
    documentUrl: string,
  ): Promise<IndexableConfluenceDocument[]> {
    this.logger.debug(`fetching document content ${documentUrl}`);

    const data = await this.get<ConfluenceDocument>(
      `${documentUrl}?expand=body.storage,space,ancestors,version`,
    );
    if (!data.status || data.status !== 'current') {
      return [];
    }

    const ancestors: IndexableAncestorRef[] = [
      {
        title: data.space.name,
        location: `${this.wikiUrl}${data.space._links.webui}`,
      },
    ];

    data.ancestors.forEach(ancestor => {
      ancestors.push({
        id: uuidv4(),
        title: ancestor.title,
        location: `${this.wikiUrl}${ancestor._links.webui}`,
      });
    });
    return [
      {
        title: data.title,
        text: '', // the content of this space is not displayed in the UI
        location: `${this.wikiUrl}${data._links.webui}`,
        spaceKey: data.space.key,
        spaceName: data.space.name,
        ancestors: ancestors,
        lastModifiedBy: data.version.by.displayName,
        lastModified: data.version.when,
        lastModifiedFriendly: new Date(data.version.when).toLocaleDateString(),
      },
    ];
  }

  getAuthorizationHeader(): string {
    if (this.auth.token) {
      return `Bearer ${this.auth.token}`;
    }

    return `Basic ${Buffer.from(
      `${this.auth.username}:${this.auth.password}`,
      'utf-8',
    ).toString('base64')}`;
  }

  async get<T = any>(requestUrl: string): Promise<T> {
    const Authorization = this.getAuthorizationHeader();
    const res = await fetch(requestUrl, {
      method: 'get',
      headers: {
        Authorization,
      },
    });

    if (!res.ok) {
      this.logger.warn(
        'non-ok response from confluence',
        requestUrl,
        res.status,
        await res.text(),
      );

      throw new Error(`Request failed with ${res.status} ${res.statusText}`);
    }

    return await res.json();
  }
}
