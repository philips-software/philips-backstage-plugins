import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import {
  SearchFilterResultTypeBlueprint,
  SearchResultListItemBlueprint,
} from '@backstage/plugin-search-react/alpha';
import { ConfluenceSearchIcon } from './icons';

/**
 * A search result list item extension for Confluence.
 *
 * @public
 */
export const confluenceSearchResultListItem =
  SearchResultListItemBlueprint.make({
    params: {
      component: () =>
        import('./components/ConfluenceResultListItem').then(
          m => m.ConfluenceResultListItem,
        ),
      predicate: result => result.type === 'confluence',
    },
  });

/**
 * A search filter result type extension for Confluence.
 *
 * @public
 */
export const confluenceSearchFilterResultType =
  SearchFilterResultTypeBlueprint.make({
    params: {
      name: 'Confluence',
      value: 'confluence',
      icon: <ConfluenceSearchIcon />,
    },
  });

/**
 * A plugin to display search results from Confluence.
 *
 * @public
 */
export default createFrontendPlugin({
  pluginId: 'search-confluence-frontend',
  extensions: [
    confluenceSearchResultListItem,
    confluenceSearchFilterResultType,
  ],
});
