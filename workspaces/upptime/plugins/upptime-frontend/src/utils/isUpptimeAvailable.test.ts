import { Entity } from '@backstage/catalog-model';
import { isUpptimeAvailable } from './isUpptimeAvailable';

describe('isUpptimeAvailable', () => {
  it('should return true if annotation is present', () => {
    const entity = {
      metadata: {
        annotations: {
          'upptime.js.org/key': 'testkey',
        },
      },
    } as unknown as Entity;

    expect(isUpptimeAvailable(entity)).toBe(true);
  });

  it.each(['', undefined, null])(
    'should return false if annotation is present but empty',
    testValue => {
      const entity = {
        metadata: {
          annotations: {
            'upptime.js.org/key': testValue,
          },
        },
      } as unknown as Entity;

      expect(isUpptimeAvailable(entity)).toBe(false);
    },
  );

  it('should return false if annotation is not present', () => {
    const entity = {
      metadata: {
        annotations: {},
      },
    } as unknown as Entity;

    expect(isUpptimeAvailable(entity)).toBe(false);
  });

  it('should return false if annotations property not present', () => {
    const entity = {
      metadata: {},
    } as unknown as Entity;

    expect(isUpptimeAvailable(entity)).toBe(false);
  });
});
