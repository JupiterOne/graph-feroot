import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../client';

const step: IntegrationStep<IntegrationConfig> = {
  id: 'fetch-pageguard-projects',
  name: 'Fetch Pageguard Projects',
  types: ['feroot_pageguard_project'],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const apiClient = createAPIClient(instance.config);

    await apiClient.getPageguardProjects(async (project) => {
      await jobState.addEntity(
        createIntegrationEntity({
          entityData: {
            source: project,
            assign: {
              _type: 'feroot_pageguard_project',
              _class: 'Project',
              _key: `pg:${project.uuid}`,
              displayName: project.name,
              activatedAt: project.activatedAt,
              active: !!project.activatedAt,
            },
          },
        }),
      );
    });
  },
};

export default step;
