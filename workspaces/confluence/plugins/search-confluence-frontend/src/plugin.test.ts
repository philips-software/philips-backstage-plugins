import searchConfluenceFrontendPlugin, {
  confluenceSearchFilterResultType,
  confluenceSearchResultListItem,
} from './alpha';

describe('search-confluence', () => {
  it('should export the frontend plugin and its search extensions', () => {
    expect(searchConfluenceFrontendPlugin).toBeDefined();
    expect(confluenceSearchResultListItem).toBeDefined();
    expect(confluenceSearchFilterResultType).toBeDefined();
  });
});
