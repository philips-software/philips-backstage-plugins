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
      token?: string;
    };
    /**
     * @visibility backend
     */
    category: string[];

    /**
     * @visibility backend
     */
    retries?: {
      /**
       * Number of attempts to retry.
       * Defaults to 3.
       * @visibility backend
       */
      attempts?: string;

      /**
       * Minimum delay between retries in milliseconds.
       * Defaults to 5000.
       * @visibility backend
       */
      delay?: string;
    };
  };
}
