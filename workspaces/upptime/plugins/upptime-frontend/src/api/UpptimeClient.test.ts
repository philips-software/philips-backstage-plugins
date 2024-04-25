import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { UpptimeClient } from './UpptimeClient';
import {
  CompoundEntityRef,
  Entity,
  getCompoundEntityRef,
} from '@backstage/catalog-model';
import { IdentityApi } from '@backstage/core-plugin-api';
import fetchMock from 'jest-fetch-mock';

const identityApiAuthenticated: IdentityApi = {
  signOut: jest.fn(),
  getProfileInfo: jest.fn(),
  getBackstageIdentity: jest.fn(),
  getCredentials: jest.fn().mockResolvedValue({ token: 'fake-id-token' }),
};

const mockEntity = {
  kind: 'component',
  metadata: {
    name: 'testcomponent',
    namespace: 'testnamespace',
  },
} as Entity;

const validResponse =
  '{"responseTime":{"schemaVersion":1,"label":"response time","message":"95 ms","color":"brightgreen"},"uptime":{"schemaVersion":1,"label":"uptime","message":"100%","color":"brightgreen"}}';

const mockBaseUrl = 'https://backstage:9191/api/upptime';
const discoveryApi = UrlPatternDiscovery.compile(mockBaseUrl);

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('UpptimeClient', () => {
  describe('getSummaryImageUrl', () => {
    it('should return the correct URL for the entity', async () => {
      const api = new UpptimeClient({
        discoveryApi,
        identityApi: identityApiAuthenticated,
      });

      const result = await api.getSummaryImageUrl(
        getCompoundEntityRef(mockEntity),
      );

      expect(result).toBe(
        'https://backstage:9191/api/upptime/summary/component/testnamespace/testcomponent/graph',
      );
    });
  });
  describe('getSummary', () => {
    it('should return response time object', async () => {
      fetchMock.mockResponse(validResponse);

      const api = new UpptimeClient({
        discoveryApi,
        identityApi: identityApiAuthenticated,
      });

      const result = await api.getSummary(getCompoundEntityRef(mockEntity));

      expect(result?.responseTime).toEqual(
        expect.objectContaining({
          schemaVersion: 1,
          label: 'response time',
          message: '95 ms',
          color: 'brightgreen',
        }),
      );
    });

    it('should return undefined if no entity is passed', async () => {
      const api = new UpptimeClient({
        discoveryApi,
        identityApi: identityApiAuthenticated,
      });

      const result = await api.getSummary(
        undefined as unknown as CompoundEntityRef,
      );

      expect(result).toBe(undefined);
    });
  });

  it('should return undefined if api does not return 200', async () => {
    fetchMock.mockResponse('', { status: 404 });

    const api = new UpptimeClient({
      discoveryApi,
      identityApi: identityApiAuthenticated,
    });

    const result = await api.getSummary(getCompoundEntityRef(mockEntity));

    expect(result).toBe(undefined);
  });

  it('should return undefined if API call fails', async () => {
    fetchMock.mockReject();

    const api = new UpptimeClient({
      discoveryApi,
      identityApi: identityApiAuthenticated,
    });

    const result = await api.getSummary(getCompoundEntityRef(mockEntity));

    expect(result).toBe(undefined);
  });
});
