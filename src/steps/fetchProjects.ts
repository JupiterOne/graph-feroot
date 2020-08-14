import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createIntegrationRelationship,
  JobState,
  Entity,
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

async function getDomainEntity(
  domain: string,
  jobState: JobState,
): Promise<Entity> {
  let domainEntityKey = `web-app-domain:${domain}`;
  let domainEntity = await jobState.getData<Entity>(domainEntityKey);
  if (!domainEntity) {
    domainEntity = await jobState.addEntity(
      createIntegrationEntity({
        entityData: {
          source: {
            name: domain,
          },
          assign: {
            _key: domainEntityKey,
            _type: 'web_app_domain',
            _class: ['Application'],
            displayName: domain,
          },
        },
      }),
    );
    await jobState.setData(domainEntityKey, domainEntity);
  }
  return domainEntity;
}

const step: IntegrationStep<IntegrationConfig> = {
  id: 'fetch-projects',
  name: 'Fetch Projects',
  types: [
    'feroot_project',
    'feroot_project_folder_has_project',
    'feroot_project_monitors_host',
    'feroot_project_contains_pageguard_project',
    'web_app_domain',
    'feroot_project_monitors_web_app_domain',
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

      let domain = new URI(project.urls[0]).domain(); // all urls in a project share the same domain
      let domainEntity = await getDomainEntity(domain, jobState);
      await jobState.addRelationship(
        createIntegrationRelationship({
          _class: 'MONITORS',
          fromKey: project.uuid,
          fromType: 'feroot_project',
          toKey: domainEntity._key,
          toType: domainEntity._type,
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
            _class: 'CONTAINS',
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
