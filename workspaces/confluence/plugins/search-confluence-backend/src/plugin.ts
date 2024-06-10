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
  moduleId: 'confluence',
  pluginId: 'confluence-search-backend',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
        indexRegistry: searchIndexRegistryExtensionPoint,
      },
      async init({ config, logger, scheduler, indexRegistry }) {
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
