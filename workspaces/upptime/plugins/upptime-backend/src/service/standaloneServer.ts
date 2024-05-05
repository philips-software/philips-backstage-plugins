/* istanbul ignore file */
import { UrlReaders, createServiceBuilder } from '@backstage/backend-common';
import { Server } from 'http';
import { Logger } from 'winston';
import { createRouter } from './router';
import { ConfigReader } from '@backstage/config';
import { CatalogApi } from '@backstage/catalog-client';
import { AuthService } from '@backstage/backend-plugin-api';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'upptime-backend' });
  const config = new ConfigReader({
    upptime: {
      locations: {
        default: {
          url: 'https://github.com/upptime/upptime/',
        },
      },
    },
  });

  const mockCatalogApi = {
    getEntityByRef: () => {
      return {
        kind: 'component',
        metadata: {
          name: 'my-component',
          namespace: 'default',
          annotations: {
            'upptime.js.org/key': 'google',
          },
        },
      };
    },
  } as unknown as CatalogApi;

  const mockUrlReader = UrlReaders.default({
    logger: logger,
    config: config,
  });
  const auth = {
    getPluginRequestToken: jest.fn().mockResolvedValue({ token: 'mytoken' }),
    getOwnServiceCredentials: jest.fn(),
  } as unknown as AuthService;

  logger.debug('Starting application server...');
  const router = await createRouter({
    logger,
    catalog: mockCatalogApi,
    config,
    reader: mockUrlReader,
    auth,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/upptime', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
