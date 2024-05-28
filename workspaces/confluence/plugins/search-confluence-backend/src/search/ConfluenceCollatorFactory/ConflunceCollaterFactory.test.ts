import { ConfluenceCollatorFactory } from './ConfluenceCollatorFactory';
import { ConfigReader } from '@backstage/config';
import { getVoidLogger } from '@backstage/backend-common';
import fetch from 'jest-fetch-mock';

const createConfig = new ConfigReader({
  confluence: {
    wikiUrl: 'https://confluence.atlas.philips.com',
    auth: {
      username: 'testCode1',
      password: 'testPassword',
      token: 'token',
    },
    category: ['label1', 'label2', 'label3'],
  },
});

const createCredentialsConfig = new ConfigReader({
  confluence: {
    wikiUrl: 'https://confluence.atlas.philips.com',
    auth: {
      username: 'testCode1',
      password: 'testPassword',
    },
    category: ['label1', 'label2', 'label3'],
  },
});

const createTokenConfig = new ConfigReader({
  confluence: {
    wikiUrl: 'https://confluence.atlas.philips.com',
    auth: {
      token: 'token',
    },
    category: ['label1', 'label2', 'label3'],
  },
});

describe('Testing ConfluenceCollatorFactory', () => {
  const logger = getVoidLogger();
  // #
  it('should check for execute function', async () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );

    const collator = await confluenceCollatorFactory.getCollator();

    expect(collator).toBeDefined();
    expect(typeof collator).toBe('object');
  });

  it('should return a map of labels to spaces', async () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );
    confluenceCollatorFactory.get = jest
      .fn()
      .mockResolvedValueOnce({
        results: [
          {
            key: 'space1',
            metadata: {
              labels: { results: [{ name: 'label1' }, { name: 'label2' }] },
            },
          },
          {
            key: 'space2',
            metadata: { labels: { results: [{ name: 'label2' }] } },
          },
        ],
        _links: { next: '/next' },
      })
      .mockResolvedValueOnce({
        results: [],
        _links: { next: null },
      });

    const spacesByLabel = await confluenceCollatorFactory.getSpacesByLabel();

    expect(spacesByLabel).toBeDefined();
    expect(Object.keys(spacesByLabel).length).toBe(2);
    /* eslint-disable dot-notation */
    expect(spacesByLabel['label1']).toContain('space1');
    expect(spacesByLabel['label2']).toContain('space1');
    expect(spacesByLabel['label2']).toContain('space2');
  });

  it('should handle no results from API', async () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );
    confluenceCollatorFactory.get = jest.fn().mockResolvedValue({});

    const spacesByLabel = await confluenceCollatorFactory.getSpacesByLabel();

    expect(spacesByLabel).toEqual({});
  });

  it('should return a sorted list of space keys', async () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );

    // Mock the get function to return different lastModified dates for different space keys
    confluenceCollatorFactory.get = jest.fn().mockImplementation(searchUrl => {
      if (searchUrl.includes('space1')) {
        return Promise.resolve({
          results: [{ lastModified: '2022-01-03T00:00:00Z' }],
        });
      } else if (searchUrl.includes('space2')) {
        return Promise.resolve({
          results: [{ lastModified: '2022-01-02T00:00:00Z' }],
        });
      } else if (searchUrl.includes('space3')) {
        return Promise.resolve({
          results: [{ lastModified: '2022-01-01T00:00:00Z' }],
        });
      }
      // Default return value
      return Promise.resolve({ results: [] });
    });

    const sortedSpaceKeys =
      await confluenceCollatorFactory.sortSpaceByLastModified([
        'space1',
        'space2',
        'space3',
      ]);

    expect(sortedSpaceKeys.length).toBe(3);
    // Checks that the space keys are sorted in the expected order
    expect(sortedSpaceKeys).toEqual(['space1', 'space2', 'space3']);
  });

  async function setupConfluenceCollatorFactory(mockValue: Object) {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );
    confluenceCollatorFactory.get = jest.fn().mockResolvedValue(mockValue);
    return confluenceCollatorFactory;
  }

  it('should check for fetched documents from a spaces', async () => {
    const mockValue = {
      results: [{ _links: { self: 'doc1' } }, { _links: { self: 'doc2' } }],
      _links: { next: null },
    };
    const confluenceCollatorFactory = await setupConfluenceCollatorFactory(
      mockValue,
    );
    const documents = await confluenceCollatorFactory.getDocumentsFromSpace(
      'space1',
    );
    expect(documents).toContain('doc1');
    expect(documents).toContain('doc2');
  });

  it('should handle missing results in document', async () => {
    const mockValue = {
      _links: { next: null },
    };
    const confluenceCollatorFactory = await setupConfluenceCollatorFactory(
      mockValue,
    );

    const documents = await confluenceCollatorFactory.getDocumentsFromSpace(
      'space1',
    );

    expect(documents).toBeDefined();
    expect(documents.length).toBe(0); // No documents should be returned because results is missing
  });

  it('should handle next _link in json', async () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );
    confluenceCollatorFactory.get = jest
      .fn()
      .mockResolvedValueOnce({
        results: [{ _links: { self: 'doc1' } }, { _links: { self: 'doc2' } }],
        _links: { next: 'https://example.com/next' },
      })
      .mockResolvedValueOnce({
        results: [{ _links: { self: 'doc3' } }, { _links: { self: 'doc4' } }],
        _links: { next: null },
      });

    const documents = await confluenceCollatorFactory.getDocumentsFromSpace(
      'space1',
    );

    expect(documents).toContain('doc1');
    expect(documents).toContain('doc2');
    expect(documents).toContain('doc3');
    expect(documents).toContain('doc4');
  });

  it('should fetch required data from a space key', async () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );

    confluenceCollatorFactory.get = jest.fn().mockResolvedValue({
      status: 'current',
      title: 'doc1',
      space: { name: 'space1', _links: { webui: '/space1' } },
      ancestors: [{ title: 'ancestor1', _links: { webui: '/ancestor1' } }],
      version: { by: { displayName: 'user1' }, when: '2022-01-01T00:00:00Z' },
      _links: { webui: '/doc1' },
    });

    const documentInfo = await confluenceCollatorFactory.getDocumentInfo(
      'doc1',
    );
    expect(documentInfo.length).toBe(1);
    expect(documentInfo[0].title).toBe('doc1');
    expect(documentInfo[0].spaceName).toBe('space1');
    expect(documentInfo[0].lastModifiedBy).toBe('user1');
  });

  it('should return empty when status is missing', async () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );
    confluenceCollatorFactory.get = jest.fn().mockResolvedValue({
      title: 'doc1',
      space: { name: 'space1', _links: { webui: '/space1' } },
      ancestors: [{ title: 'ancestor1', _links: { webui: '/ancestor1' } }],
      version: { by: { displayName: 'user1' }, when: '2022-01-01T00:00:00Z' },
      _links: { webui: '/doc1' },
    });

    const documentInfo = await confluenceCollatorFactory.getDocumentInfo(
      'doc1',
    );

    expect(documentInfo).toBeDefined();
    expect(documentInfo.length).toBe(0); // No document info should be returned because status is missing
  });

  it('should return correct data from get', async () => {
    fetch.mockResponseOnce(JSON.stringify({ key: 'value' }));

    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );
    const data = await confluenceCollatorFactory.get('https://example.com');

    expect(data).toBeDefined();
    expect(data.key).toBe('value');
  });

  it('should throw an error for a non-ok response', async () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );

    fetch.mockResponseOnce('Not Found', { status: 404 });

    await expect(
      confluenceCollatorFactory.get('https://example.com'),
    ).rejects.toThrow('Not Found');
  });

  it('should return Bearer token if token is present', () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createTokenConfig,
      { logger },
    );
    const authHeader = confluenceCollatorFactory.getAuthorizationHeader();
    expect(authHeader).toBe('Bearer token');
  });

  it('should return Basic auth if username and password are present', () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createCredentialsConfig,
      { logger },
    );
    const authHeader = confluenceCollatorFactory.getAuthorizationHeader();
    const expectedAuth = `Basic ${Buffer.from(
      'testCode1:testPassword',
      'utf-8',
    ).toString('base64')}`;
    expect(authHeader).toBe(expectedAuth);
  });

  it('should return a list of spaces by category', async () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );
    confluenceCollatorFactory.getSpacesByLabel = jest.fn().mockResolvedValue({
      category1: ['space1', 'space2'],
      category2: ['space3', 'space4'],
    });
    confluenceCollatorFactory.sortSpaceByLastModified = jest
      .fn()
      .mockResolvedValue(['space1', 'space2', 'space3', 'space4']);

    confluenceCollatorFactory.category = ['category1', 'category2'];

    const spaces = await confluenceCollatorFactory.getSpaces();
    expect(spaces).toContain('space1');
    expect(spaces).toContain('space2');
    expect(spaces).toContain('space3');
    expect(spaces).toContain('space4');
  });

  it('should handle errors correctly', async () => {
    const confluenceCollatorFactory = ConfluenceCollatorFactory.fromConfig(
      createConfig,
      { logger },
    );

    confluenceCollatorFactory.getSpaces = jest
      .fn()
      .mockResolvedValue(['space1', 'space2']);
    confluenceCollatorFactory.getDocumentsFromSpaces = jest
      .fn()
      .mockResolvedValue(['doc1', 'doc2']);
    confluenceCollatorFactory.getDocumentInfo = jest
      .fn()
      .mockRejectedValue(new Error('Test error'));

    const documents = [];
    for await (const document of confluenceCollatorFactory.execute()) {
      documents.push(document);
    }

    expect(documents).toBeDefined();
    expect(documents.length).toBe(0); // No documents should be returned because getDocumentInfo throws an error
  });
});
