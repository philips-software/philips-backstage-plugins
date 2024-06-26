import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { upptimeApiRef } from './api';
import { UpptimeClient } from './api/UpptimeClient';

/**
 * Upptime frontend plugin
 *
 * @public
 */
export const upptimePlugin = createPlugin({
  id: 'upptimePlugin',
  apis: [
    createApiFactory({
      api: upptimeApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, identityApi }) =>
        new UpptimeClient({
          discoveryApi,
          identityApi,
        }),
    }),
  ],
});

/**
 * Upptime Entity card
 *
 * @public
 */
export const EntityUpptimeCard = upptimePlugin.provide(
  createComponentExtension({
    name: 'EntityUpptimeCard',
    component: {
      lazy: () =>
        import('./components/EntityUpptimeCard').then(m => m.EntityUpptimeCard),
    },
  }),
);
