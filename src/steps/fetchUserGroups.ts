import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../client';
import { Steps, Entities } from '../constants';

const step: IntegrationStep<IntegrationConfig> = {
  id: Steps.GROUPS,
  name: 'Fetch UserGroups',
  entities: [Entities.GROUP],
  relationships: [],
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
              _type: Entities.GROUP._type,
              _class: Entities.GROUP._class,
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
