import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const searchConfluenceFrontendPlugin = createPlugin({
  id: 'search-confluence-frontend',
  routes: {
    root: rootRouteRef,
  },
});

export const SearchConfluenceFrontendPage = searchConfluenceFrontendPlugin.provide(
  createRoutableExtension({
    name: 'SearchConfluenceFrontendPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
