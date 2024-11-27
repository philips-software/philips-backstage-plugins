import React, { ComponentType } from 'react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { TemplateEntityV1beta3 } from '@backstage/plugin-scaffolder-common';
import {
  Content,
  ItemCardGrid,
  Link,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { useEntityList } from '@backstage/plugin-catalog-react';
import { Typography } from '@material-ui/core';
import { TemplateCard } from '../TemplateCard';

export type TemplateListProps = {
  TemplateCardComponent?: ComponentType<{ template: TemplateEntityV1beta3 }>;
  group?: {
    title?: React.ReactNode;
    filter: (entity: Entity) => boolean;
  };
};

export const TemplateList = ({
  TemplateCardComponent,
  group,
}: TemplateListProps) => {
  const { loading, error, entities } = useEntityList();
  const Card = TemplateCardComponent ?? TemplateCard;
  const maybeFilteredEntities = group
    ? entities.filter(e => group.filter(e))
    : entities;

  if (group && maybeFilteredEntities.length === 0) {
    return null;
  }
  return (
    <>
      {loading && <Progress />}

      {error && (
        <WarningPanel title="Oops! Something went wrong loading the Github Action Marketplace">
          {error.message}
        </WarningPanel>
      )}

      {!error && !loading && !entities.length && (
        <Typography variant="body2">
          No GitHub Actions found that match your filter. Learn more about{' '}
          <Link to="/create">
            adding your GitHub Action to the marketplace.
          </Link>
          .
        </Typography>
      )}

      <Content>
        <ItemCardGrid>
          {maybeFilteredEntities &&
            maybeFilteredEntities?.length > 0 &&
            maybeFilteredEntities.map((template: Entity) => (
              <Card
                key={stringifyEntityRef(template)}
                template={template as TemplateEntityV1beta3}
              />
            ))}
        </ItemCardGrid>
      </Content>
    </>
  );
};
