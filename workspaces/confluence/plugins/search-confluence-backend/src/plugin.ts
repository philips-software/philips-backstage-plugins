/* istanbul ignore file */
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { readTaskScheduleDefinitionFromConfig } from '@backstage/backend-tasks';
import { searchIndexRegistryExtensionPoint } from '@backstage/plugin-search-backend-node/alpha';
import {
  ConfluenceCollatorFactory,
  confluenceDefaultSchedule,
} from './search/ConfluenceCollatorFactory';
import { loggerToWinstonLogger } from '@backstage/backend-common';

/**
 * Confluence search backend plugin
 *
 * @public
 */
export const confluencePlugin = createBackendModule({
  pluginId: 'search',
  moduleId: 'confluence-collator',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        scheduler: coreServices.scheduler,
        indexRegistry: searchIndexRegistryExtensionPoint,
      },
      async init({ config, logger, scheduler, indexRegistry }) {
        // The schedule is determined by the configuration if available.
        // If not, the Confluence plugin's default schedule is used.
        const schedule = config.has('confluence.schedule')
          ? readTaskScheduleDefinitionFromConfig(
              config.getConfig('confluence.schedule'),
            )
          : confluenceDefaultSchedule;

        indexRegistry.addCollator({
          schedule: scheduler.createScheduledTaskRunner(schedule),
          factory: ConfluenceCollatorFactory.fromConfig(config, {
            logger: loggerToWinstonLogger(logger),
          }),
        });
      },
    });
  },
});
