import { Entity } from '@backstage/catalog-model';

export const UPPTIME_ANNOTATION = 'upptime.js.org/key';
export const UPPTIME_INSTANCE_SEPARATOR = '/';

export const useUpptimeInfo = (
  entity: Entity,
): {
  instance: string | undefined;
  key: string | undefined;
} => {
  let upptimeInstance = undefined;
  let upptimeKey = undefined;
  const annotation = entity.metadata.annotations?.[UPPTIME_ANNOTATION];
  if (annotation) {
    const instanceSeparatorIndex = annotation.indexOf(
      UPPTIME_INSTANCE_SEPARATOR,
    );
    if (instanceSeparatorIndex > -1) {
      // Example:
      //   instanceA/keyA  -> upptimeInstance = "instanceA" & upptimeKey = "projectA"
      upptimeInstance = annotation.substring(0, instanceSeparatorIndex);
      upptimeKey = annotation.substring(instanceSeparatorIndex + 1);
    } else {
      upptimeKey = annotation;
    }
  }
  return { instance: upptimeInstance, key: upptimeKey };
};
