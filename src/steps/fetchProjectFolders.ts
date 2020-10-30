import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../client';
import { Steps, Entities, Relationships } from '../constants';

const step: IntegrationStep<IntegrationConfig> = {
  id: Steps.PROJECT_FOLDERS,
  name: 'Fetch ProjectFolders',
  entities: [Entities.PROJECT_FOLDER],
  relationships: [Relationships.GROUP_HAS_PROJECT_FOLDER],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const apiClient = createAPIClient(instance.config);

    await apiClient.getProjectFolders(async (folder) => {
      await jobState.addEntity(
        createIntegrationEntity({
          entityData: {
            source: folder,
            assign: {
              _type: Entities.PROJECT_FOLDER._type,
              _class: Entities.PROJECT_FOLDER._class,
              _key: folder.uuid,
              displayName: folder.name,
            },
          },
        }),
      );

      for (let userGroup of folder.userGroups || []) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: userGroup,
            fromType: Entities.GROUP._type,
            toKey: folder.uuid,
            toType: Entities.PROJECT_FOLDER._type,
          }),
        );
      }
    });
  },
};

export default step;
