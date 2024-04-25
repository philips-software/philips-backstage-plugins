import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { upptimePlugin, EntityUpptimeCard } from '../src/plugin';

createDevApp()
  .registerPlugin(upptimePlugin)
  .addPage({
    element: <EntityUpptimeCard />,
    title: 'Root Page',
    path: '/upptime',
  })
  .render();
