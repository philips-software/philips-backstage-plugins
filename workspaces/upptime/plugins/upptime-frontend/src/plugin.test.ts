import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { upptimePlugin } from './plugin';
import { IdentityApi } from '@backstage/core-plugin-api';

describe('upptime-frontend', () => {
  it('should export plugin', () => {
    expect(upptimePlugin).toBeDefined();
  });

  it('should export an api', () => {
    const identityApi: IdentityApi = {
      signOut: jest.fn(),
      getProfileInfo: jest.fn(),
      getBackstageIdentity: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ token: 'fake-id-token' }),
    };
    const mockBaseUrl = 'https://backstage:9191/api/upptime';
    const discoveryApi = UrlPatternDiscovery.compile(mockBaseUrl);

    const apis = [...upptimePlugin.getApis()];
    expect(apis.length).toBe(1);

    const api = apis[0].factory({
      discoveryApi,
      identityApi,
    });

    expect(api).toBeDefined();
  });
});
