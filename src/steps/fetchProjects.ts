import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createIntegrationRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../client';
import URI from 'urijs';

function convertProjectStatus(status: number): string {
  switch (status) {
    case 1:
      return 'Active';
    case 2:
      return 'Deleted';
    case 3:
      return 'Paused';
  }
  return 'Unknown';
}

const step: IntegrationStep<IntegrationConfig> = {
  id: 'fetch-projects',
  name: 'Fetch Projects',
  types: [
    'feroot_project',
    'feroot_project_folder_has_project',
    'feroot_project_monitors_host',
    'feroot_project_includes_pageguard_project',
  ],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const apiClient = createAPIClient(instance.config);

    await apiClient.getProjects(async (project) => {
      await jobState.addEntity(
        createIntegrationEntity({
          entityData: {
            source: project,
            assign: {
              _type: 'feroot_project',
              _class: 'Project',
              _key: project.uuid,
              displayName: project.name,
              status: convertProjectStatus(project.status),
              active: project.status === 1,
              urls: project.urls,
            },
          },
        }),
      );

      let hostname = URI(project.urls[0]).host();
      await jobState.addRelationship(
        createIntegrationRelationship({
          _class: 'MONITORS',
          _type: 'feroot_project_monitors_host',
          _mapping: {
            relationshipDirection: RelationshipDirection.FORWARD,
            sourceEntityKey: project.uuid,
            targetFilterKeys: [['_class', 'hostname']],
            targetEntity: {
              _class: 'Host',
              _type: 'host',
              hostname: hostname,
              displayName: hostname,
            },
            skipTargetCreation: !instance.config.createTargetHosts,
          },
        }),
      );

      if (project.projectGroup) {
        await jobState.addRelationship(
          createIntegrationRelationship({
            _class: 'HAS',
            fromKey: project.projectGroup,
            fromType: 'feroot_project_folder',
            toKey: project.uuid,
            toType: 'feroot_project',
          }),
        );
      }

      if (project.pageguardUuid) {
        await jobState.addRelationship(
          createIntegrationRelationship({
            _class: 'INCLUDES',
            fromKey: project.uuid,
            fromType: 'feroot_project',
            toKey: `pg:${project.pageguardUuid}`,
            toType: 'feroot_pageguard_project',
          }),
        );
      }
    });
  },
};

export default step;
