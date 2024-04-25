import { getVoidLogger } from '@backstage/backend-common';
import { UpptimeAPI } from './UpptimeAPI';
import { ConfigReader } from '@backstage/config';

const logger = getVoidLogger();

const defaultConfig = new ConfigReader({
  upptime: {
    locations: {
      default: {
        url: 'https://blah.com',
      },
    },
  },
});

describe('UpptimeApi', () => {
  it('should return default config baseurl', async () => {
    const api = UpptimeAPI.fromConfig(defaultConfig, logger);

    expect(api.getBaseUrlAndKey('my-component')).toMatchObject(
      expect.objectContaining({
        baseUrl: 'https://blah.com',
      }),
    );
  });

  it('should return named config baseurl', async () => {
    const config = new ConfigReader({
      upptime: {
        locations: {
          default: {
            url: 'https://blah.com',
          },
          otherconfig: {
            url: 'https://someotherurl.com',
          },
        },
      },
    });

    const api = UpptimeAPI.fromConfig(config, logger);

    expect(api.getBaseUrlAndKey('otherconfig/my-component')).toMatchObject(
      expect.objectContaining({
        baseUrl: 'https://someotherurl.com',
      }),
    );
  });

  it('should throw an error when no annotation exists', async () => {
    const api = UpptimeAPI.fromConfig(defaultConfig, logger);

    expect(() => api.getBaseUrlAndKey('')).toThrow('Upptime annotation');
  });

  it('should throw an error when no config exists for annotation', async () => {
    const api = UpptimeAPI.fromConfig(
      new ConfigReader({ upptime: { locations: {} } }),
      logger,
    );

    expect(() => api.getBaseUrlAndKey('my-key')).toThrow(
      'Unable to find Upptime instance config for',
    );
  });
});
