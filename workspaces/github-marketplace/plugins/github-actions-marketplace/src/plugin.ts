import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { MarketplaceProps } from './components/Marketplace/Marketplace';
import { rootRouteRef } from './routes';

export { type MarketplaceProps as DefaultCatalogPageProps } from './components/Marketplace/Marketplace';

/**
 * Github Marketplace plugin
 * @public
 */
export const marketplacePlugin = createPlugin({
  id: 'github-marketplace',
});

/**
 * GitHub Actions Marketplace Page
 *
 * @public
 */
export const Marketplace: (props: MarketplaceProps) => JSX.Element =
  marketplacePlugin.provide(
    createRoutableExtension({
      name: 'Marketplace',
      component: () =>
        import('./components/Marketplace').then(m => m.MarketPlace),
      mountPoint: rootRouteRef,
    }),
  );

/**
 * Entity card that shows the installation steps for the GitHub Action
 *
 * @public
 */
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

/**
 * Entity card that shows a user how to use the GitHub Action
 *
 * @public
 */
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
