# Upptime Backend

Welcome to the upptime-backend backend plugin!

## Integrating into a backstage instance

This plugin needs to be added to an existing backstage instance.

```bash
# From your Backstage root directory
yarn add --cwd packages/backend @philips-software/backstage-plugin-upptime-backend
```

You can then add the follwoing to your backend configuration in `backend/src/index.ts`:

```typescript
backend.add(import('@philips-software/backstage-plugin-upptime-backend'));
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
