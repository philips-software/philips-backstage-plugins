import { TemplateEntityV1beta3 } from '@backstage/plugin-scaffolder-common';
import { Content, PageWithHeader } from '@backstage/core-components';
import {
  CatalogFilterLayout,
  EntityLifecyclePicker,
  EntityListProvider,
  EntityOwnerPicker,
  EntitySearchBar,
  EntityTagPicker,
  EntityTypePicker,
  UserListPicker,
} from '@backstage/plugin-catalog-react';
import React, { ComponentType } from 'react';
import { Entity } from '@backstage/catalog-model';
import { TemplateList } from '../TemplateList';

export interface DefaultCatalogPageProps {
  TemplateCardComponent?: ComponentType<{ template: TemplateEntityV1beta3 }>;
  groups?: Array<{
    title?: React.ReactNode;
    filter: (entity: Entity) => boolean;
  }>;
}

export const MarketPlace = (props: DefaultCatalogPageProps) => {
  const { TemplateCardComponent, groups } = props;

  const otherTemplatesGroup = {
    title: groups ? 'Other Templates' : ' ',
    filter: (entity: Entity) => {
      const filtered = (groups ?? []).map(group => group.filter(entity));

      return !filtered.some(result => result === true);
    },
  };

  return (
    <PageWithHeader title="Internal GitHub Actions Marketplace" themeId="home">
      <EntityListProvider>
        <Content>
          <CatalogFilterLayout>
            <CatalogFilterLayout.Filters>
              <EntityTypePicker initialFilter="github-action" />
              <EntitySearchBar />
              <UserListPicker
                initialFilter="all"
                availableFilters={['all', 'starred']}
              />
              <EntityOwnerPicker />
              <EntityLifecyclePicker />
              <EntityTagPicker />
            </CatalogFilterLayout.Filters>
            <CatalogFilterLayout.Content>
              <TemplateList
                key="other"
                TemplateCardComponent={TemplateCardComponent}
                group={otherTemplatesGroup}
              />
            </CatalogFilterLayout.Content>
          </CatalogFilterLayout>
        </Content>
      </EntityListProvider>
    </PageWithHeader>
  );
};
