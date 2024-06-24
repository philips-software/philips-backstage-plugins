import { searchConfluenceFrontendPlugin } from './plugin';

describe('search-confluence', () => {
  it('should export search-confluence Plugin', () => {
    expect(searchConfluenceFrontendPlugin).toBeDefined();
  });
});
