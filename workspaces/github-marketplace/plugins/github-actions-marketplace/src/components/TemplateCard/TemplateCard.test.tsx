import { DefaultStarredEntitiesApi } from '@backstage/plugin-catalog';
import {
  entityRouteRef,
  starredEntitiesApiRef,
} from '@backstage/plugin-catalog-react';
import {
  MockStorageApi,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { TemplateCard } from './TemplateCard';
import React from 'react';
import { TemplateEntityV1beta3 } from '@backstage/plugin-scaffolder-common';
import { RELATION_OWNED_BY } from '@backstage/catalog-model';
import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
} from '@backstage/integration-react';

const mockIntegrationsApi = {
  byUrl: () => ({ type: 'github' }),
} as ScmIntegrationsApi;

describe('TemplateCard', () => {
  it('should render the card title', async () => {
    const mockTemplate: TemplateEntityV1beta3 = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: {
        name: 'bob',
        annotations: {
          'backstage.io/source-location':
            'url:https://github.com/philips-test/test',
        },
      },
      spec: {
        steps: [],
        type: 'service',
      },
    };

    const { getByText } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [scmIntegrationsApiRef, mockIntegrationsApi],
          [
            starredEntitiesApiRef,
            new DefaultStarredEntitiesApi({
              storageApi: MockStorageApi.create(),
            }),
          ],
        ]}
      >
        <TemplateCard template={mockTemplate} />
      </TestApiProvider>,
    );

    expect(getByText('bob')).toBeInTheDocument();
  });

  it('should render the description as markdown', async () => {
    const mockTemplate: TemplateEntityV1beta3 = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: { name: 'bob', description: 'hello **test**' },
      spec: {
        steps: [],
        type: 'service',
      },
    };

    const { getByText } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [scmIntegrationsApiRef, mockIntegrationsApi],
          [
            starredEntitiesApiRef,
            new DefaultStarredEntitiesApi({
              storageApi: MockStorageApi.create(),
            }),
          ],
        ]}
      >
        <TemplateCard template={mockTemplate} />
      </TestApiProvider>,
    );

    const description = getByText('hello');
    expect(description.querySelector('strong')).toBeInTheDocument();
  });

  it('should render the tags', async () => {
    const mockTemplate: TemplateEntityV1beta3 = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: { name: 'bob', tags: ['cpp', 'react'] },
      spec: {
        steps: [],
        type: 'service',
      },
    };

    const { getByText } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [scmIntegrationsApiRef, mockIntegrationsApi],
          [
            starredEntitiesApiRef,
            new DefaultStarredEntitiesApi({
              storageApi: MockStorageApi.create(),
            }),
          ],
        ]}
      >
        <TemplateCard template={mockTemplate} />
      </TestApiProvider>,
    );

    for (const tag of mockTemplate.metadata.tags!) {
      expect(getByText(tag)).toBeInTheDocument();
    }
  });

  it('should render a link to the owner', async () => {
    const mockTemplate: TemplateEntityV1beta3 = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: { name: 'bob', tags: ['cpp', 'react'] },
      spec: {
        steps: [],
        type: 'service',
      },
      relations: [
        {
          targetRef: 'group:default/my-test-user',
          type: RELATION_OWNED_BY,
        },
      ],
    };

    const { getByRole } = await renderInTestApp(
      <TestApiProvider
        apis={[
          [scmIntegrationsApiRef, mockIntegrationsApi],
          [
            starredEntitiesApiRef,
            new DefaultStarredEntitiesApi({
              storageApi: MockStorageApi.create(),
            }),
          ],
        ]}
      >
        <TemplateCard template={mockTemplate} />
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:kind/:namespace/:name': entityRouteRef,
        },
      },
    );

    const userLink = getByRole('link', { name: /my-test-user/ });

    expect(userLink).toBeInTheDocument();
    expect(userLink).toHaveAttribute(
      'href',
      '/catalog/group/default/my-test-user',
    );
  });
});
