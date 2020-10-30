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
  id: Steps.ALERTS,
  name: 'Fetch Alerts',
  entities: [Entities.ALERT],
  relationships: [Relationships.PROJECT_GENERATED_ALERT],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const apiClient = createAPIClient(instance.config);

    await apiClient.getProjectAlerts(
      async (alert) => {
        await jobState.addEntity(
          createIntegrationEntity({
            entityData: {
              source: alert,
              assign: {
                _type: Entities.ALERT._type,
                _class: Entities.ALERT._class,
                _key: alert.id,
                id: alert.id,
                name: alert.alertType || 'unknown-alert',
                category: 'Feroot Alert',
                severity: 'major',
                reportable: true,

                displayName: alert.title,
                eventsCount: alert.eventsCount,
                open: alert.state === 1,
              },
            },
          }),
        );
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.GENERATED,
            fromKey: alert.projectUuid,
            fromType: Entities.PROJECT._type,
            toKey: alert.id,
            toType: Entities.ALERT._type,
          }),
        );
      },
      {
        activeOnly: !instance.config.includeResolvedAlerts,
      },
    );
  },
};

export default step;
