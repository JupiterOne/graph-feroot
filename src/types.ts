import { IntegrationInstanceConfig } from '@jupiterone/integration-sdk-core';

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  /**
   * The provider API key used to authenticate requests.
   */
  ferootApiKey: string;

  /**
   * Indicates whether monitoring hosts should be created if not present in J1 workspace
   */
  createTargetHosts?: boolean;

  /**
   * Indicates whether to preserve entities for resolved alerts or to remove all resolved alerts
   * from the graph
   */
  includeResolvedAlerts?: boolean;

  /**
   * Custom feroot base url for testing purposes
   */
  ferootBaseUrl?: string;
}
