import {
  ReadTreeResponse,
  ReadTreeResponseFile,
  UrlReader,
  getVoidLogger,
} from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';
import { Entity } from '@backstage/catalog-model';
import { createRouter } from './router';
import { ConfigReader } from '@backstage/config';
import { CatalogApi } from '@backstage/catalog-client';
import { AuthService } from '@backstage/backend-plugin-api';

describe('createRouter', () => {
  let app: express.Express;
  type MockCatalogApi = jest.Mocked<Pick<CatalogApi, 'getEntityByRef'>>;

  const mockCatalogApi: MockCatalogApi = {
    getEntityByRef: jest.fn(),
  };
  const catalogApi = mockCatalogApi as unknown as CatalogApi;

  const mockUrlReader: jest.Mocked<UrlReader> = {
    readUrl: jest.fn(),
    readTree: jest.fn(),
    search: jest.fn(),
  };
  const auth = {
    getPluginRequestToken: jest.fn(),
    getOwnServiceCredentials: jest.fn(),
  };
  const config = new ConfigReader({
    upptime: {
      locations: {
        default: {
          url: 'https://myrepo.com/myorg/myrepo',
        },
        status: {
          url: 'https://anotherrepo.com/myorg/status',
        },
      },
    },
  });
  beforeEach(async () => {
    jest.resetAllMocks();
    auth.getPluginRequestToken.mockResolvedValue({ token: 'mytoken' });
    const router = await createRouter({
      logger: getVoidLogger(),
      catalog: catalogApi,
      config,
      reader: mockUrlReader,
      auth: auth as unknown as AuthService,
    });
    app = express().use(router);
  });

  describe('GET /summary', () => {
    it('returns summary from default config', async () => {
      mockCatalogApi.getEntityByRef.mockResolvedValue(
        getEntityWithAnnotation('my-component'),
      );

      mockUrlReader.readTree.mockResolvedValue(getReadTreeResponse());

      const response = await request(app).get(
        '/summary/component/default/my-component',
      );

      expect(mockUrlReader.readTree).toHaveBeenCalledWith(
        'https://myrepo.com/myorg/myrepo/blob/master/api/my-component',
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          uptime: expect.objectContaining({
            schemaVersion: 1,
            label: 'uptime',
            message: '100%',
            color: 'brightgreen',
          }),
        }),
      );
    });

    it('returns summary from named config', async () => {
      mockCatalogApi.getEntityByRef.mockResolvedValue(
        getEntityWithAnnotation('status/my-component'),
      );

      mockUrlReader.readTree.mockResolvedValue(getReadTreeResponse());

      const response = await request(app).get(
        '/summary/component/default/my-component',
      );

      expect(response.status).toEqual(200);
      expect(mockUrlReader.readTree).toHaveBeenCalledWith(
        'https://anotherrepo.com/myorg/status/blob/master/api/my-component',
      );
      expect(response.body).toEqual(
        expect.objectContaining({
          uptime: expect.objectContaining({
            schemaVersion: 1,
            label: 'uptime',
            message: '100%',
            color: 'brightgreen',
          }),
        }),
      );
    });

    it('should call catalog api with bearer token', async () => {
      mockCatalogApi.getEntityByRef.mockResolvedValue({
        kind: 'component',
        metadata: {
          name: 'my-component',
          namespace: 'default',
          annotations: {},
        },
      } as unknown as Entity);

      await request(app)
        .get('/summary/component/default/my-component')
        .set({ Authorization: 'Bearer mybearertoken' });

      expect(mockCatalogApi.getEntityByRef).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          token: 'mytoken',
        }),
      );
    });
  });

  describe('GET /summary/x/y/z/graph', () => {
    it('returns graph from default config', async () => {
      mockCatalogApi.getEntityByRef.mockResolvedValue(
        getEntityWithAnnotation('my-component'),
      );

      mockUrlReader.readUrl.mockResolvedValue(getGraphPngBuffer());

      const response = await request(app).get(
        '/summary/component/default/my-component/graph',
      );

      expect(mockUrlReader.readUrl).toHaveBeenCalledWith(
        'https://myrepo.com/myorg/myrepo/blob/master/graphs/my-component/response-time.png',
      );
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(89);
    });

    it('returns graph from named config', async () => {
      mockCatalogApi.getEntityByRef.mockResolvedValue(
        getEntityWithAnnotation('status/my-component'),
      );

      mockUrlReader.readUrl.mockResolvedValue(getGraphPngBuffer());

      const response = await request(app).get(
        '/summary/component/default/my-component/graph',
      );

      expect(mockUrlReader.readUrl).toHaveBeenCalledWith(
        'https://anotherrepo.com/myorg/status/blob/master/graphs/my-component/response-time.png',
      );
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(89);
    });
  });

  describe.each([
    ['/summary/component/default/my-component'],
    ['/summary/component/default/my-component/graph'],
  ])('Common', endpoint => {
    it('returns 404 when entity not found', async () => {
      mockCatalogApi.getEntityByRef.mockResolvedValue(undefined);

      const response = await request(app).get(endpoint);

      expect(response.status).toEqual(404);
    });

    it('returns 404 when entity has no annotation', async () => {
      mockCatalogApi.getEntityByRef.mockResolvedValue({
        kind: 'component',
        metadata: {
          name: 'my-component',
          namespace: 'default',
          annotations: {},
        },
      } as unknown as Entity);

      const response = await request(app).get(endpoint);

      expect(response.status).toEqual(404);
    });

    it('returns 400 when annotation contains illegal characters', async () => {
      mockCatalogApi.getEntityByRef.mockResolvedValue(
        getEntityWithAnnotation('status/my-component/something?else'),
      );

      const response = await request(app).get(endpoint);

      expect(response.status).toEqual(400);
    });

    it('returns 404 when no files in the status repo', async () => {
      mockCatalogApi.getEntityByRef.mockResolvedValue(
        getEntityWithAnnotation('my-component'),
      );

      mockUrlReader.readUrl.mockResolvedValue({
        buffer: async () => {
          return Buffer.from('');
        },
      });

      mockUrlReader.readTree.mockResolvedValue({
        files: async () => [] as unknown as ReadTreeResponseFile[],
      } as unknown as ReadTreeResponse);

      const response = await request(app).get(endpoint);

      expect(response.status).toEqual(404);
    });
  });
});

function getReadTreeResponse() {
  return {
    files: async () => {
      return [
        {
          content: async () => {
            return Buffer.from(
              '{"schemaVersion":1,"label":"uptime","message":"100%","color":"brightgreen"}',
            );
          },
        },
        {
          content: async () => {
            return Buffer.from(
              '{"schemaVersion":1,"label":"response time","message":"0 ms","color":"red"}',
            );
          },
        },
      ] as unknown as ReadTreeResponse;
    },
  } as unknown as ReadTreeResponse;
}

function getGraphPngBuffer() {
  return {
    buffer: async () => {
      return Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII',
        'base64',
      );
    },
  };
}

function getEntityWithAnnotation(annotation: string): Entity {
  return {
    kind: 'component',
    metadata: {
      name: 'my-component',
      namespace: 'default',
      annotations: {
        'upptime.js.org/key': annotation,
      },
    },
  } as unknown as Entity;
}
