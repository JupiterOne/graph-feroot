import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../client';

const step: IntegrationStep<IntegrationConfig> = {
  id: 'fetch-project-folders',
  name: 'Fetch ProjectFolders',
  types: ['feroot_project_folder', 'feroot_user_group_has_project_folder'],
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
              _type: 'feroot_project_folder',
              _class: 'Group',
              _key: folder.uuid,
              displayName: folder.name,
            },
          },
        }),
      );

      for (let userGroup of folder.userGroups || []) {
        await jobState.addRelationship(
          createIntegrationRelationship({
            _class: 'HAS',
            fromKey: userGroup,
            fromType: 'feroot_user_group',
            toKey: folder.uuid,
            toType: 'feroot_project_folder',
          }),
        );
      }
    });
  },
};

export default step;
