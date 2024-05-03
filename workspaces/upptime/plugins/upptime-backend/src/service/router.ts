import { UrlReader, errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { NotFoundError } from '@backstage/errors';
import { UpptimeAPI } from '../api/UpptimeAPI';
import { Entity } from '@backstage/catalog-model';
import * as path from 'path';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { UPPTIME_ANNOTATION } from '../constants';

export interface RouterOptions {
  logger: LoggerService;
  catalog: CatalogApi;
  config: Config;
  reader: UrlReader;
  auth: AuthService;
}

const getUpptimeAnnotation = (entity: Entity): string | undefined =>
  entity.metadata.annotations![UPPTIME_ANNOTATION];

const getUrlFromBase = (baseUrl: string, pathSegments: string[]) => {
  const base = new URL(baseUrl);
  base.pathname = path.join(base.pathname, ...pathSegments);
  return base.href;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, catalog, reader, config, auth } = options;

  const upptimeAPi = UpptimeAPI.fromConfig(config, logger);

  const router = Router();
  router.use(express.json());

  router.get('/summary/:kind/:namespace/:name', async (req, res) => {
    const { kind, namespace, name } = req.params;

    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    const key = await resolveEntityAndGetAnnotation(
      { kind, namespace, name },
      token,
    );

    const { baseUrl, instanceName, instanceKey } =
      upptimeAPi.getBaseUrlAndKey(key);

    const result = await reader.readTree(
      getUrlFromBase(baseUrl, ['blob', 'master', 'api', instanceKey]),
    );
    const files = await result.files();

    if (files.length === 0) {
      throw new NotFoundError(
        `There is no Upptime monitoring with key ${instanceKey} in the upptime instance ${instanceName}`,
      );
    }

    const response = await files.reduce(async (acc, file) => {
      const responseObject = await acc;
      const fileContents = (await file.content()).toString();
      const fileJson = JSON.parse(fileContents);
      if (fileJson.label === 'uptime') {
        responseObject.uptime = fileJson;
      }

      if (fileJson.label === 'response time') {
        responseObject.responseTime = fileJson;
      }
      return await acc;
    }, Promise.resolve({} as { uptime: any; responseTime: any }));

    res.status(200).json(response);
  });

  router.get('/summary/:kind/:namespace/:name/graph', async (req, res) => {
    const { kind, namespace, name } = req.params;

    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    const key = await resolveEntityAndGetAnnotation(
      { kind, namespace, name },
      token,
    );
    const { baseUrl, instanceName, instanceKey } =
      upptimeAPi.getBaseUrlAndKey(key);

    const response = await reader.readUrl(
      getUrlFromBase(baseUrl, [
        'blob',
        'master',
        'graphs',
        instanceKey,
        'response-time.png',
      ]),
    );

    const imgBuffer = await response.buffer();

    if (imgBuffer.length === 0) {
      throw new NotFoundError(
        `There is no Upptime monitoring with key ${instanceKey} in the upptime instance ${instanceName}`,
      );
    }

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imgBuffer.length,
    });
    res.end(imgBuffer);
  });

  router.use(errorHandler());
  return router;

  async function resolveEntityAndGetAnnotation(
    entityFilter: { kind: string; namespace: string; name: string },
    token: string,
  ): Promise<string> {
    const { kind, namespace, name } = entityFilter;

    let entity: Entity | undefined;
    try {
      entity = await catalog.getEntityByRef(
        { namespace, kind, name },
        {
          token,
        },
      );
      // When the entity is not found it resolves with undefined rather than rejecting
      if (!entity) {
        throw new Error();
      }
    } catch (error) {
      const message = `No ${kind} entity in ${namespace} named "${name}"`;
      logger.debug(message);
      throw new NotFoundError(message);
    }

    const key = getUpptimeAnnotation(entity);
    if (!key) {
      throw new NotFoundError(
        `No annotation (${UPPTIME_ANNOTATION}) found on entity "${entity.metadata.name}"`,
      );
    }

    return key;
  }
}
