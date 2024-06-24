import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { UpptimeApi, UpptimeSummary } from './UpptimeApi';
import { CompoundEntityRef } from '@backstage/catalog-model';

export class UpptimeClient implements UpptimeApi {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
  }

  private async callApi<T>(
    path: string,
    entity: CompoundEntityRef,
  ): Promise<T | undefined> {
    const { token: idToken } = await this.identityApi.getCredentials();
    const apiUrl = `${await this.discoveryApi.getBaseUrl('upptime')}`;

    try {
      const response = await fetch(
        `${apiUrl}/${path}/${entity.kind}/${entity.namespace}/${entity.name}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(idToken && { Authorization: `Bearer ${idToken}` }),
          },
        },
      );
      if (response.status === 200) {
        return (await response.json()) as T;
      }
    } catch (error) {
      return undefined;
    }
    return undefined;
  }

  async getCookie(): Promise<void> {
    const { token: idToken } = await this.identityApi.getCredentials();

    const apiUrl = `${await this.discoveryApi.getBaseUrl('upptime')}`;

    await fetch(`${apiUrl}/cookie`, {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });
  }

  async getSummaryImageUrl(entity: CompoundEntityRef): Promise<string> {
    const apiUrl = `${await this.discoveryApi.getBaseUrl('upptime')}`;

    return `${apiUrl}/summary/${entity.kind}/${entity.namespace}/${entity.name}/graph`;
  }

  async getSummary(
    entity: CompoundEntityRef,
  ): Promise<UpptimeSummary | undefined> {
    if (!entity) {
      return undefined;
    }
    const findings = await this.callApi<UpptimeSummary>('summary', entity);
    if (!findings) {
      return undefined;
    }
    return findings;
  }
}
