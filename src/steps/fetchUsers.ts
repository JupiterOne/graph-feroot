import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../client';

const step: IntegrationStep<IntegrationConfig> = {
  id: 'fetch-users',
  name: 'Fetch Users',
  types: ['feroot_user', 'feroot_user_group_has_user'],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const apiClient = createAPIClient(instance.config);

    await apiClient.getUsers(async (user) => {
      await jobState.addEntity(
        createIntegrationEntity({
          entityData: {
            source: user,
            assign: {
              _type: 'feroot_user',
              _class: 'User',
              _key: user.uuid,
              displayName: `${user.firstName} ${user.lastName}`,
              name: user.email,
              username: user.email,
            },
          },
        }),
      );

      for (let userGroup of user.userGroups) {
        await jobState.addRelationship(
          createIntegrationRelationship({
            _class: 'HAS',
            fromKey: userGroup,
            fromType: 'feroot_user_group',
            toKey: user.uuid,
            toType: 'feroot_user',
          }),
        );
      }
    });
  },
};

export default step;
