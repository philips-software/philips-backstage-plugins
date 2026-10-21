import { useEntity } from '@backstage/plugin-catalog-react';

export const useProjectEntity = () => {
  const projectSlug = useEntity().entity.metadata?.annotations?.[
    'backstage.io/source-location'
  ].split('github.com/')[1] as string;
  return {
    owner: projectSlug.split('/')[0],
    repo: projectSlug.split('/')[1],
  };
};
