import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  searchConfluenceFrontendPlugin,
  SearchConfluenceFrontendPage,
} from '../src/plugin';

createDevApp()
  .registerPlugin(searchConfluenceFrontendPlugin)
  .addPage({
    element: <SearchConfluenceFrontendPage />,
    title: 'Root Page',
    path: '/search-confluence-frontend',
  })
  .render();
