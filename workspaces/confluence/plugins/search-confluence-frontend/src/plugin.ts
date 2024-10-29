import { createPlugin } from '@backstage/core-plugin-api';

/**
 * A plugin to display search results from Confluence.
 *
 * @public
 */
export const searchConfluenceFrontendPlugin = createPlugin({
  id: 'search-confluence-frontend',
});
