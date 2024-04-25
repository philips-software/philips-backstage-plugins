import React from 'react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  TestApiProvider,
  renderWithEffects,
  wrapInTestApp,
} from '@backstage/test-utils';
import { EntityUpptimeCard } from './EntityUpptimeCard';
import { ComponentEntity, Entity } from '@backstage/catalog-model';
import { UpptimeApi, upptimeApiRef } from '../../api';
import { ApiRef } from '@backstage/core-plugin-api';

const entityWithAnnotation = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'system-a',
    description: 'the test system',
    namespace: 'default',
    annotations: { 'upptime.js.org/key': 'my-service' },
  },
} as unknown as ComponentEntity;

const upptimeApi: Partial<UpptimeApi> = {
  getSummary: jest.fn(),
  getSummaryImageUrl: jest.fn(),
};

describe('EntityUpptimeCard', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('renders EntityUptimeCard', async () => {
    upptimeApi.getSummary = jest.fn().mockReturnValue({
      uptime: getUptimeMetric({
        label: 'uptime',
        message: '100%',
        color: 'brightgreen',
      }),
      responseTime: getUptimeMetric({
        label: 'response time',
        message: '95 ms',
        color: 'red',
      }),
    });

    const rendered = await creatTestApp(
      [[upptimeApiRef, upptimeApi]],
      entityWithAnnotation,
    );

    expect(rendered.getByText('system-a - Status')).toBeInTheDocument();
    expect(rendered.getByText('Overall Uptime: 100%')).toBeInTheDocument();
    expect(
      rendered.getByText('Average Response Time: 95 ms'),
    ).toBeInTheDocument();
    expect(rendered.getByLabelText('Status ok')).toBeInTheDocument();
    expect(rendered.getByLabelText('Status error')).toBeInTheDocument();
  });

  it('renders unknown status dot', async () => {
    upptimeApi.getSummary = jest.fn().mockReturnValue({
      uptime: getUptimeMetric({
        color: 'someunknowncolor',
      }),
      responseTime: getUptimeMetric(),
    });

    const rendered = await creatTestApp(
      [[upptimeApiRef, upptimeApi]],
      entityWithAnnotation,
    );

    expect(rendered.getByLabelText('Status pending')).toBeInTheDocument();
  });

  it('does not render when showAnnotationHelp is set to false', async () => {
    const rendered = await creatTestApp(
      [[upptimeApiRef, upptimeApi]],
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'system-a',
          description: 'the test system',
          namespace: 'default',
        },
      } as unknown as ComponentEntity,
      <EntityUpptimeCard showAnnotationHelp={false} />,
    );

    expect(rendered.queryByText('system-a - Status')).not.toBeInTheDocument();
  });

  it('should show annotation help', async () => {
    const rendered = await creatTestApp([[upptimeApiRef, upptimeApi]], {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'system-a',
        description: 'the test system',
        namespace: 'default',
      },
    } as unknown as ComponentEntity);

    expect(rendered.getByText('Missing Annotation')).toBeInTheDocument();
  });
});

function creatTestApp(
  apis: [[ApiRef<UpptimeApi>, Partial<UpptimeApi>]],
  entity: Entity,
  card?: JSX.Element,
) {
  return renderWithEffects(
    wrapInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={entity}>
          {card ?? <EntityUpptimeCard />}
        </EntityProvider>
      </TestApiProvider>,
    ),
  );
}

function getUptimeMetric(
  values: {
    label?: string;
    message?: string;
    color?: string;
  } = {
    label: 'response time',
    message: '95 ms',
    color: 'red',
  },
) {
  return {
    schemaVersion: 1,
    label: values.label,
    message: values.message,
    color: values.color,
  };
}
