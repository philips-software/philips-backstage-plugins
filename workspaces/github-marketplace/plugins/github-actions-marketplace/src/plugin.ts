import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { DefaultCatalogPageProps } from './components/Marketplace/Marketplace';
import { rootRouteRef } from './routes';

export const marketplacePlugin = createPlugin({
  id: 'github-marketplace',
});

/** @public */
export const Marketplace: (props: DefaultCatalogPageProps) => JSX.Element =
  marketplacePlugin.provide(
    createRoutableExtension({
      name: 'Marketplace',
      component: () =>
        import('./components/Marketplace').then(m => m.MarketPlace),
      mountPoint: rootRouteRef,
    }),
  );

/** @public */
export const EntityGitHubActionInstallationCard = marketplacePlugin.provide(
  createComponentExtension({
    name: 'EntityGitHubActionInstallationCard',
    component: {
      lazy: () =>
        import('./components/EntityGitHubActionInstallationCard').then(
          m => m.EntityGitHubActionInstallationCard,
        ),
    },
  }),
);

/** @public */
export const EntityGitHubActionUsageCard = marketplacePlugin.provide(
  createComponentExtension({
    name: 'EntityGitHubActionUsageCard',
    component: {
      lazy: () =>
        import('./components/EntityGitHubActionUsageCard').then(
          m => m.EntityGitHubActionUsageCard,
        ),
    },
  }),
);
