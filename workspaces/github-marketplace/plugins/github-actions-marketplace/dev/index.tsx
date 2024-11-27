import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { marketplacePlugin } from '../src/plugin';
import { MarketPlace } from '../src/components/Marketplace';

createDevApp()
  .registerPlugin(marketplacePlugin)
  .addPage({
    element: <MarketPlace />,
    title: 'Root Page',
    path: '/plugin-github-action-marketplace',
  })
  .render();
