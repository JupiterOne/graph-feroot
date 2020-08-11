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
        id: 'abc',
        projectUuid: 'zzz',
        state: 1,
        title: 'Some alert',
      },
      {
        alertType: 'alert-type-2',
        eventsCount: 2,
        id: 'abc2',
        projectUuid: 'zzz2',
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
        id: 'abc',
        _type: 'feroot_alert',
        _class: ['Incident'],
        _key: 'abc',
        name: 'alert-type',
        category: 'Feroot Alert',
        severity: 'major',
        reportable: true,
        displayName: 'Some alert',
        eventsCount: 1,
        active: true,
        _rawData: [
          {
            name: 'default',
            rawData: items[0],
          },
        ],
      },
      {
        id: 'abc2',
        _type: 'feroot_alert',
        _class: ['Incident'],
        _key: 'abc2',
        name: 'alert-type-2',
        category: 'Feroot Alert',
        severity: 'major',
        reportable: true,
        displayName: 'Some alert 2',
        eventsCount: 2,
        active: false,
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
        _key: 'zzz|generated|abc',
        _type: 'feroot_project_generated_alert',
        _class: 'GENERATED',
        _fromEntityKey: 'zzz',
        _toEntityKey: 'abc',
        displayName: 'GENERATED',
      },
      {
        _key: 'zzz2|generated|abc2',
        _type: 'feroot_project_generated_alert',
        _class: 'GENERATED',
        _fromEntityKey: 'zzz2',
        _toEntityKey: 'abc2',
        displayName: 'GENERATED',
      },
    ]);
  });
});
