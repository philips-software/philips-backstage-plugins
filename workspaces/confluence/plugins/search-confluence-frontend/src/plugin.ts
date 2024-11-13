import { createPlugin } from '@backstage/core-plugin-api';
import {
  createSearchResultListItemExtension,
  SearchResultListItemExtensionProps,
} from '@backstage/plugin-search-react';
import { ConfluenceResultItemProps } from './components/ConfluenceResultListItem';

/**
 * A plugin to display search results from Confluence.
 *
 * @public
 */
export const searchConfluenceFrontendPlugin = createPlugin({
  id: 'search-confluence-frontend',
});

/**
 * A search result item extension for Confluence.
 *
 * @public */
export const ConfluenceResultListItem: (
  props: SearchResultListItemExtensionProps<ConfluenceResultItemProps>,
) => JSX.Element | null = searchConfluenceFrontendPlugin.provide(
  createSearchResultListItemExtension({
    name: 'ConfluenceResultListItem',
    component: () =>
      import('./components/ConfluenceResultListItem').then(
        m => m.ConfluenceResultListItem,
      ),
    predicate: result => result.type === 'confluence',
  }),
);
