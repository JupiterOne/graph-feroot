import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import instanceConfigFields from './instanceConfigFields';
import { IntegrationConfig } from './types';
import validateInvocation from './validateInvocation';
import * as steps from './steps';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: Object.values(steps),
};
