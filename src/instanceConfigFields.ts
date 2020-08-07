import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';

const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  ferootApiKey: {
    type: 'string',
    mask: true,
  },
  createTargetHosts: {
    type: 'boolean',
  },
  includeResolvedAlerts: {
    type: 'boolean',
  },
};

export default instanceConfigFields;
