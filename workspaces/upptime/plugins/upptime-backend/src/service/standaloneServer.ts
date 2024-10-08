/* istanbul ignore file */
import { createServiceBuilder } from '@backstage/backend-common';
import { Server } from 'http';
import { Logger } from 'winston';
import { createRouter } from './router';
import { CatalogApi } from '@backstage/catalog-client';
import { AuthService, HttpAuthService } from '@backstage/backend-plugin-api';

import { mockServices } from '@backstage/backend-test-utils';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'upptime-backend' });
  const config = mockServices.rootConfig({
    data: {
      upptime: {
        locations: {
          default: {
            url: 'https://github.com/upptime/upptime/',
          },
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

  const mockUrlReader = mockServices.urlReader.mock();
  const auth = {
    getPluginRequestToken: jest.fn().mockResolvedValue({ token: 'mytoken' }),
    getOwnServiceCredentials: jest.fn(),
  } as unknown as AuthService;
  const httpAuth = {
    issueUserCookie: jest.fn(),
  } as unknown as HttpAuthService;
  logger.debug('Starting application server...');
  const router = await createRouter({
    logger,
    catalog: mockCatalogApi,
    config,
    reader: mockUrlReader,
    auth,
    httpAuth,
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
