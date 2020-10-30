import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../client';
import { Entities, Steps, Relationships } from '../constants';

const step: IntegrationStep<IntegrationConfig> = {
  id: Steps.USERS,
  name: 'Fetch Users',
  entities: [Entities.USER],
  relationships: [Relationships.GROUP_HAS_USER],
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
              _type: Entities.USER._type,
              _class: Entities.USER._class,
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
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: userGroup,
            fromType: Entities.GROUP._type,
            toKey: user.uuid,
            toType: Entities.USER._type,
          }),
        );
      }
    });
  },
};

export default step;
