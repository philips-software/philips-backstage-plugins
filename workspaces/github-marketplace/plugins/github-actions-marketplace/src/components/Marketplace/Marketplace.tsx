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

/**
 * Default Catalog Page Props
 *
 * @public
 */
export interface MarketplaceProps {
  /**
   * Template Card Component
   */
  TemplateCardComponent?: ComponentType<{ template: TemplateEntityV1beta3 }>;
  /**
   * Groups that can be used to filter and group the templates
   */
  groups?: Array<{
    title?: React.ReactNode;
    filter: (entity: Entity) => boolean;
  }>;
}

/**
 * GitHub Marketplace Page
 *
 * @returns
 */
export const MarketPlace = (props: MarketplaceProps) => {
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
