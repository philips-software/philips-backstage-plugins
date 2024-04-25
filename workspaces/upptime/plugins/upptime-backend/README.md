# Upptime Backend

Welcome to the upptime-backend backend plugin!

## Integrating into a backstage instance

This plugin needs to be added to an existing backstage instance.

```bash
# From your Backstage root directory
yarn add --cwd packages/backend @backstage/plugin-upptime-backend
```

Typically, this means creating a `src/plugins/upptime.ts` file and adding a
reference to it to `src/index.ts` in the backend package.

### upptime.ts

```typescript
import { createRouter } from '@internal/plugin-upptime-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { CatalogClient } from '@backstage/catalog-client';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });

  return await createRouter({
    logger: env.logger,
    catalog: catalogClient,
    config: env.config,
    reader: env.reader,
  });
}
```

### src/index.ts

```diff
diff --git a/packages/backend/src/index.ts b/packages/backend/src/index.ts
index 1942c36ad1..7fdc48ba24 100644
--- a/packages/backend/src/index.ts
+++ b/packages/backend/src/index.ts
@@ -50,6 +50,7 @@ import scaffolder from './plugins/scaffolder';
 import proxy from './plugins/proxy';
 import search from './plugins/search';
 import techdocs from './plugins/techdocs';
+import upptime from './plugins/upptime';
 import techInsights from './plugins/techInsights';
 import todo from './plugins/todo';
 import graphql from './plugins/graphql';
@@ -133,6 +134,7 @@ async function main() {
     createEnv('tech-insights'),
   );
   const permissionEnv = useHotMemoize(module, () => createEnv('permission'));
+  const upptimeEnv = useHotMemoize(module, () => createEnv('upptime'));

   const apiRouter = Router();
   apiRouter.use('/catalog', await catalog(catalogEnv));
@@ -152,6 +154,7 @@ async function main() {
   apiRouter.use('/badges', await badges(badgesEnv));
   apiRouter.use('/jenkins', await jenkins(jenkinsEnv));
   apiRouter.use('/permission', await permission(permissionEnv));
+  apiRouter.use('/upptime', await upptime(upptimeEnv));
   apiRouter.use(notFoundHandler());

   const service = createServiceBuilder(module)

```

### Configuration

This plugin allows configuration of either a single or multiple global Upptime
repository instances and annotating entities with the instance name. This instance
name in the entities is optional, if not provided the default instance in
configuration will be used. That allow to keep configuration from before multiple
instances capability to keep working without changes.

#### Example - Single global instance

Config

```yaml
upptime:
  locations:
    default:
      url: https://github.com/upptime/upptime/
```

Catalog file

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage
  annotations:
    upptime.js.org/key: YOUR_PROJECT_KEY
```

#### Example - Multiple global instance

The following will look for status at `https://github.com/your-otg/status/` for
the project of key `specialProject`.

Config

```yaml
upptime:
  instances:
    default:
      url: https://github.com/upptime/upptime/
    specialProject:
      url: https://github.com/your-otg/status
```

Catalog file

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage
  annotations:
    upptime.js.org/key: specialProject/YOUR_PROJECT_KEY
```

If the `specialProject/` part is omitted (or replaced with `default/`), the
instance of name `default` will be used.

## Links

- [Upptime Frontend](../upptime-frontend/README.md)
