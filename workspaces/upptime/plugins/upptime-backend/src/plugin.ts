/* istanbul ignore file */
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { CatalogClient } from '@backstage/catalog-client';

/**
 * Upptime backend plugin
 *
 * @public
 */
export const upptimeBackend = createBackendPlugin({
  pluginId: 'upptime',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        httpRouter: coreServices.httpRouter,
        reader: coreServices.urlReader,
      },
      async init({ logger, config, discovery, httpRouter, reader }) {
        const catalog = new CatalogClient({
          discoveryApi: discovery,
        });
        httpRouter.use(
          await createRouter({
            logger,
            catalog,
            config,
            reader,
          }),
        );
      },
    });
  },
});
