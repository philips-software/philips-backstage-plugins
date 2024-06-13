# Confluence Search Backend Module Plugin

A plugin that provides Confluence-specific functionality that can be used for search in your Backstage App.

[It is used in combination with its frontend counterpart](../search-confluence-frontend)

## Installation

Add the plugin to your backend app:

```sh
yarn add @philips-software/backstage-plugin-search-confluence-backend
```

# Configuration

Update `app-config.yml`

```yaml
confluence:
  schedule:
    frequency:
    # example: frequency: { minutes: 15 }
    timeout:
    # example: timeout: { minutes: 15 }
    initialDelay:
  # example initialDelay: { seconds: 3 }
  wikiUrl: https://org-name.atlassian.net/wiki
  auth:
    token: ${Your PAT Token}
  category:
#   provide the list of spaces you want to indexed
# example
# - space1
# - space2
```

## Backend Configuration (Follows new backend)

Add the collator to your backend instance, along with the search plugin itself

```typescript
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';
import { searchPlugin } from '@backstage/plugin-search-backend/alpha';
import searchConfluenceCollatorModule from '@philips-software/backstage-plugin-search-confluence-backend'; // confluence backend collator

const backend = createBackend();
backend.add(searchPlugin());
backend.add(searchConfluenceCollatorModule());
backend.start();
```
