import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../client';
import { Steps, Entities } from '../constants';

const step: IntegrationStep<IntegrationConfig> = {
  id: Steps.PAGEGUARD_PROJECTS,
  name: 'Fetch Pageguard Projects',
  entities: [Entities.PAGEGUARD_PROJECT],
  relationships: [],
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
              _type: Entities.PAGEGUARD_PROJECT._type,
              _class: Entities.PAGEGUARD_PROJECT._class,
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
