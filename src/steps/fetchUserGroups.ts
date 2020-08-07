import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../client';

const step: IntegrationStep<IntegrationConfig> = {
  id: 'fetch-user-groups',
  name: 'Fetch UserGroups',
  types: ['feroot_user_group'],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const apiClient = createAPIClient(instance.config);

    await apiClient.getUserGroups(async (group) => {
      await jobState.addEntity(
        createIntegrationEntity({
          entityData: {
            source: group,
            assign: {
              _type: 'feroot_user_group',
              _class: 'UserGroup',
              _key: group.uuid,
              displayName: group.name,
            },
          },
        }),
      );
    });
  },
};

export default step;
