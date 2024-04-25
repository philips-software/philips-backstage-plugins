import { Entity } from '@backstage/catalog-model';
import { useUpptimeInfo } from './useUpptimeInfo';

describe('UseUpptimeInfo', () => {
  it('should return key when specified', () => {
    const result = useUpptimeInfo({
      metadata: {
        annotations: {
          'upptime.js.org/key': 'project-key',
        },
      },
    } as unknown as Entity);
    expect(result.key).toBe('project-key');
    expect(result.instance).toBeUndefined();
  });

  it('should return instance when specified', () => {
    const result = useUpptimeInfo({
      metadata: {
        annotations: {
          'upptime.js.org/key': 'myinstance/project-key',
        },
      },
    } as unknown as Entity);
    expect(result.key).toBe('project-key');
    expect(result.instance).toBe('myinstance');
  });

  it('should return undefined when no annotation defined', () => {
    const result = useUpptimeInfo({
      metadata: {},
    } as unknown as Entity);
    expect(result.key).toBeUndefined();
    expect(result.instance).toBeUndefined();
  });
});
