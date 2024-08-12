---
'@philips-software/backstage-plugin-search-confluence-backend': patch
---

fixed the `token` property in Confluence Integration to be marked as a secret in `config.d.ts`, preventing unintended exposure.
