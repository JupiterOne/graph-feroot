import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createDirectRelationship,
  JobState,
  Entity,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../client';
import URI from 'urijs';
import { Entities, Relationships, Steps } from '../constants';

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
            _type: Entities.DOMAIN._type,
            _class: Entities.DOMAIN._class,
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
  id: Steps.PROJECTS,
  name: 'Fetch Projects',
  entities: [Entities.PROJECT, Entities.DOMAIN],
  relationships: [
    Relationships.PROJECT_MONITORS_DOMAIN,
    Relationships.PROJECT_FOLDER_HAS_PROJECT,
    Relationships.PROJECT_CONTAINS_PAGEGUARD_PROJECT,
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
              _type: Entities.PROJECT._type,
              _class: Entities.PROJECT._class,
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
        createDirectRelationship({
          _class: RelationshipClass.MONITORS,
          fromKey: project.uuid,
          fromType: Entities.PROJECT._type,
          toKey: domainEntity._key,
          toType: Entities.DOMAIN._type,
        }),
      );

      if (project.projectGroup) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: project.projectGroup,
            fromType: Entities.PROJECT_FOLDER._type,
            toKey: project.uuid,
            toType: Entities.PROJECT._type,
          }),
        );
      }

      if (project.pageguardUuid) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONTAINS,
            fromKey: project.uuid,
            fromType: Entities.PROJECT._type,
            toKey: `pg:${project.pageguardUuid}`,
            toType: Entities.PAGEGUARD_PROJECT._type,
          }),
        );
      }
    });
  },
};

export default step;
