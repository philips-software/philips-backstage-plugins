import { HumanDuration } from '@backstage/types';

export interface Config {
  confluence: {
    /**
     * Schedule for some task
     * @visibility backend
     */
    schedule: {
      frequency: HumanDuration;
      timeout: HumanDuration;
      initialDelay: HumanDuration;
    };
    /**
     * Confluence base URL for wiki API
     * Typically: https://{org-name}.atlassian.net/wiki
     * @visibility backend
     */
    wikiUrl: string;

    /**
     * Spaces to index
     * @visibility backend
     */
    spaces: string[];

    /**
     * @visibility backend
     */
    auth: {
      /**
       * @visibility backend
       */
      username?: string;

      /**
       * @visibility secret
       */
      password?: string;
      /**
       * @visibility secret
       */
      auth?: string;
    };
    /**
     * @visibility backend
     */
    category: string[];
  };
}
