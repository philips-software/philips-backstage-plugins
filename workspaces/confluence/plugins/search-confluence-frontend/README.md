# Backstage Confluence Search Collator Plugin

This plugin integrates Confluence documents into Backstage's search engine, enabling users to search for and retrieve Confluence content directly from Backstage App

Note: it is used in combination with its [backend counter-part](../search-confluence-backend/README.md).

Search Results:
![Search results](./docs/confluence.png)

## Installation

Add the plugin to your frontend app:

```
@philips-software/backstage-plugin-search-confluence-frontend
```

Add The Confluence Search Component to : `packages/app/src/components/search/SearchPage.tsx `

```tsx
// packages/app/src/components/search/SearchPage.tsx

import {
  ConfluenceSearchIcon,
  ConfluenceResultListItem,
} from '@philips-software/backstage-plugin-search-confluence-frontend';;

// ...
<SearchType.Accordion
  name="Result Type"
  types={[
    // ...
    {
      value: 'confluence',
      name: 'Confluence',
      icon: <ConfluenceSearchIcon />,
    },
  ]}
/>

<SearchResult>
  {({ results }) => (
    <List>
      {results.map(({ type, document, highlight, rank }) => {
        switch (type) {
         // Add the following case to the switch statement above the default case
          case 'confluence':
            return (
              <ConfluenceResultListItem
                key={document.location}
                result={document}
                highlight={highlight}
              />
            );
         // ...
        }
      })}
    </List>
  )}
</SearchResult>
```
