import {
  createMockStepExecutionContext,
  MockIntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../src/types';
import { APIClient } from '../../src/client';
import * as provider from '../../src/client';

const createAPIClient: jest.Mock<APIClient, any> = <any>(
  provider.createAPIClient
);

export function createContextMocks(
  client: APIClient,
  configOverrides?: any | IntegrationConfig,
): {
  client: APIClient;
  context: MockIntegrationStepExecutionContext<IntegrationConfig>;
} {
  if (!jest.isMockFunction(createAPIClient)) {
    throw new Error(
      `API Client module is not mocked. Add "jest.mock('[...]/client');" statement into the test module`,
    );
  }

  client = <APIClient>{ ...client };
  // transform all the functions into mocked ones
  Object.entries(client).forEach((p) => {
    let [key, val] = p;
    if (typeof val === 'function' && !jest.isMockFunction(val)) {
      client[key] = jest.fn().mockImplementation(<any>val);
    }
  });
  createAPIClient.mockReturnValue(client);

  const context = createMockStepExecutionContext({
    instanceConfig: Object.assign(
      {
        ferootApiKey: 'some-key',
      },
      configOverrides,
    ),
  });

  return {
    client: client,
    context: context,
  };
}
