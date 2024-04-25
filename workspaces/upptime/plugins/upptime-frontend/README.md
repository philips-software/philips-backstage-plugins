# upptime-frontend

This plugin shows uptime and response statistics from an Upptime repository.

It works with both public and private repositories and uses the backend authentication
you already have in place in your backend, for instance GitHub app authentication.

## Getting Started

1. Install the Upptime Plugin:

```bash
# From your Backstage root directory
yarn add --cwd packages/app @philips-software/plugin-upptime-frontend
```

2. Add the `EntityUpptimeCard` to the EntityPage:

```diff
  // packages/app/src/components/catalog/EntityPage.tsx
+ import { EntityUpptimeCard } from '@backstage/plugin-upptime-frontend';

 ...

 const overviewContent = (
   <Grid container spacing={3} alignItems="stretch">
     <Grid item md={6}>
       <EntityAboutCard variant="gridItem" />
     </Grid>
+    <Grid item md={6}>
+      <EntityUpptimeCard />
+    </Grid>
   </Grid>
 );
```

3. Run the following commands in the root folder of the project to install and
4. compile the changes.

```yaml
yarn install
yarn tsc
```

4. Add the `upptime.js.org/key` annotation to the `catalog-info.yaml` file of the
5. target repository for which upptime status is needed.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage
  description: |
    Backstage is an open-source developer portal that puts the developer 
    experience first.
  annotations:
    upptime.js.org/key: YOUR_INSTANCE_NAME/YOUR_PROJECT_KEY
spec:
  type: library
  owner: CNCF
  lifecycle: experimental
```

`YOUR_INSTANCE_NAME/` is optional and will query the default instance if not provided.

## Links

- [Upptime Backend](../upptime-backend/README.md)
