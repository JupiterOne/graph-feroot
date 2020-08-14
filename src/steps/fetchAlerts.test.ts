import { FerootAlert } from '../types-feroot';
import { APIClient } from '../client';
import { createContextMocks } from '../../tests/helpers';
jest.mock('../client');

import step from './fetchAlerts';

describe('Alerts fetching', () => {
  test('requests all alerts', async () => {
    const { client, context } = createContextMocks(
      <any>{
        getProjectAlerts: () => undefined,
      },
      {
        includeResolvedAlerts: true,
      },
    );

    await step.executionHandler(context);

    expect(client.getProjectAlerts).toBeCalledWith(
      expect.anything(),
      expect.objectContaining({
        activeOnly: false,
      }),
    );
  });

  test('requests unresolved alerts', async () => {
    const { client, context } = createContextMocks(
      <any>{
        getProjectAlerts: () => undefined,
      },
      {
        includeResolvedAlerts: false,
      },
    );

    await step.executionHandler(context);

    expect(client.getProjectAlerts).toBeCalledWith(
      expect.anything(),
      expect.objectContaining({
        activeOnly: true,
      }),
    );
  });

  test('creates entities and relationships', async () => {
    let items: FerootAlert[] = [
      {
        alertType: 'alert-type',
        eventsCount: 1,
        id: 'alert-uuid-1',
        projectUuid: 'project-uuid-1',
        state: 1,
        title: 'Some alert',
      },
      {
        alertType: 'alert-type-2',
        eventsCount: 2,
        id: 'alert-uuid-2',
        projectUuid: 'project-uuid-2',
        state: 2,
        title: 'Some alert 2',
      },
    ];

    const { client, context } = createContextMocks(<APIClient>{
      async getProjectAlerts(iteratee) {
        for (let item of items) await iteratee(item);
      },
    });

    await step.executionHandler(context);

    expect(client.getProjectAlerts).toBeCalledTimes(1);

    expect(context.jobState.collectedEntities).toMatchObject([
      {
        id: 'alert-uuid-1',
        _type: 'feroot_alert',
        _class: ['Finding'],
        _key: 'alert-uuid-1',
        name: 'alert-type',
        category: 'Feroot Alert',
        severity: 'major',
        reportable: true,
        displayName: 'Some alert',
        eventsCount: 1,
        open: true,
        _rawData: [
          {
            name: 'default',
            rawData: items[0],
          },
        ],
      },
      {
        id: 'alert-uuid-2',
        _type: 'feroot_alert',
        _class: ['Finding'],
        _key: 'alert-uuid-2',
        name: 'alert-type-2',
        category: 'Feroot Alert',
        severity: 'major',
        reportable: true,
        displayName: 'Some alert 2',
        eventsCount: 2,
        open: false,
        _rawData: [
          {
            name: 'default',
            rawData: items[1],
          },
        ],
      },
    ]);
    expect(context.jobState.collectedRelationships).toMatchObject([
      {
        _key: 'project-uuid-1|generated|alert-uuid-1',
        _type: 'feroot_project_generated_alert',
        _class: 'GENERATED',
        _fromEntityKey: 'project-uuid-1',
        _toEntityKey: 'alert-uuid-1',
        displayName: 'GENERATED',
      },
      {
        _key: 'project-uuid-2|generated|alert-uuid-2',
        _type: 'feroot_project_generated_alert',
        _class: 'GENERATED',
        _fromEntityKey: 'project-uuid-2',
        _toEntityKey: 'alert-uuid-2',
        displayName: 'GENERATED',
      },
    ]);
  });
});
