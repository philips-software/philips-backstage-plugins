import { createApiRef } from '@backstage/core-plugin-api';
import { UpptimeApi } from './UpptimeApi';

export * from './UpptimeApi';
export const upptimeApiRef = createApiRef<UpptimeApi>({
  id: 'plugin.upptime.service',
});
