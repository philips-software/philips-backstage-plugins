import { Entity } from '@backstage/catalog-model';
import { UPPTIME_ANNOTATION } from '../constants';

export const isUpptimeAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[UPPTIME_ANNOTATION]);
