import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';
import { UPPTIME_ANNOTATION } from '../constants';
import { LoggerService } from '@backstage/backend-plugin-api';

export const UPPTIME_INSTANCE_SEPARATOR = '/';

export interface UpptimeAPI {
  /**
   * Get the upptime URL in configuration from a provided instanceName.
   *
   * If instanceName is omitted, default instance is queried in config
   *
   * @param instanceName - Name of the instance to get the info from
   * @returns the url of the instance
   */
  getBaseUrlAndKey(annotation: string): {
    baseUrl: string;
    instanceName: string;
    instanceKey: string;
  };
}

export interface UpptimeConfig {
  locations: {
    [key: string]: UpptimeInstanceConfig;
  };
}

export interface UpptimeInstanceConfig {
  url: string;
}

export class UpptimeAPI implements UpptimeAPI {
  private readonly locations: { [key: string]: UpptimeInstanceConfig };

  private constructor(
    upptimeConfig: UpptimeConfig,
    private readonly logger: LoggerService,
  ) {
    this.locations = upptimeConfig.locations;
  }

  /**
   * Generate an instance from a Config instance
   */
  static fromConfig(config: Config, logger: LoggerService): UpptimeAPI {
    const upptimeConfig = config.get<UpptimeConfig>('upptime');

    return new UpptimeAPI(upptimeConfig, logger);
  }

  getBaseUrlAndKey(annotation: string | undefined): {
    baseUrl: string;
    instanceName: string;
    instanceKey: string;
  } {
    if (!annotation) {
      const message = `Upptime annotation ${UPPTIME_ANNOTATION} was not found on the Entity`;
      this.logger.warn(message);
      throw new InputError(message);
    }

    let upptimeInstance = undefined;
    let upptimeKey = undefined;

    const instanceSeparatorIndex = annotation.indexOf(
      UPPTIME_INSTANCE_SEPARATOR,
    );
    if (instanceSeparatorIndex > -1) {
      // Example:
      //   instanceA/keyA  -> upptimeInstance = "instanceA" & upptimeKey = "projectA"
      upptimeInstance = annotation.substring(0, instanceSeparatorIndex);
      upptimeKey = annotation.substring(instanceSeparatorIndex + 1);
    } else {
      upptimeInstance = 'default';
      upptimeKey = annotation;
    }

    if (!/^[\w-]+$/.test(upptimeKey)) {
      const message = `Upptime annotation ${UPPTIME_ANNOTATION} - ${annotation} is invalid. The instance key (${upptimeKey}) cannot be a path.`;
      this.logger.warn(message);
      throw new InputError(message);
    }

    const instanceConfig = this.locations[upptimeInstance];

    if (!instanceConfig) {
      const message = `Unable to find Upptime instance config for ${instanceConfig}`;
      this.logger.error(message);
      throw new Error(message);
    }

    return {
      baseUrl: instanceConfig.url,
      instanceName: upptimeInstance,
      instanceKey: upptimeKey,
    };
  }
}
