import { FerootProject } from '../types-feroot';
import { APIClient } from '../client';
import { createContextMocks } from '../../tests/helpers';
jest.mock('../client');

import step from './fetchProjects';

describe('Projects fetching', () => {
  test('creates entities and relationships', async () => {
    let items: FerootProject[] = [
      {
        id: 'abc',
        name: 'name-1',
        serviceUuid: 'service-1',
        status: 1,
        urls: ['https://www.feroot.com', 'https://app.feroot.com'],
        uuid: 'uuid-1',
      },
      {
        id: 'abc-2',
        name: 'name-2',
        serviceUuid: 'service-1',
        status: 3, // paused
        urls: ['https://www.google.com'],
        uuid: 'uuid-2',
        pageguardUuid: 'pg-uuid-1',
        projectGroup: 'uuid-g1',
      },
    ];

    const { client, context } = createContextMocks(
      <APIClient>{
        async getProjects(iteratee) {
          for (let item of items) await iteratee(item);
        },
      },
      {
        createTargetHosts: false,
      },
    );

    await step.executionHandler(context);

    expect(client.getProjects).toBeCalledTimes(1);

    expect(context.jobState.collectedEntities).toMatchObject([
      {
        id: 'abc',
        name: 'name-1',
        status: 'Active',
        _type: 'feroot_project',
        _class: ['Project'],
        _key: 'uuid-1',
        displayName: 'name-1',
        active: true,
        urls: ['https://www.feroot.com', 'https://app.feroot.com'],
        _rawData: [
          {
            name: 'default',
            rawData: items[0],
          },
        ],
      },
      {
        id: 'abc-2',
        name: 'name-2',
        status: 'Paused',
        _type: 'feroot_project',
        _class: ['Project'],
        _key: 'uuid-2',
        displayName: 'name-2',
        active: false,
        urls: ['https://www.google.com'],
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
        _class: 'MONITORS',
        _mapping: {
          relationshipDirection: 'FORWARD',
          sourceEntityKey: 'uuid-1',
          targetFilterKeys: [['_class', 'hostname']],
          targetEntity: {
            _class: 'Host',
            _type: 'host',
            hostname: 'www.feroot.com',
            displayName: 'www.feroot.com',
          },
          skipTargetCreation: true,
        },
        displayName: 'MONITORS',
        _key: 'uuid-1|monitors|FORWARD:_class=Host:hostname=www.feroot.com',
        _type: 'feroot_project_monitors_host',
      },
      {
        _class: 'MONITORS',
        _mapping: {
          relationshipDirection: 'FORWARD',
          sourceEntityKey: 'uuid-2',
          targetFilterKeys: [['_class', 'hostname']],
          targetEntity: {
            _class: 'Host',
            _type: 'host',
            hostname: 'www.google.com',
            displayName: 'www.google.com',
          },
          skipTargetCreation: true,
        },
        displayName: 'MONITORS',
        _key: 'uuid-2|monitors|FORWARD:_class=Host:hostname=www.google.com',
        _type: 'feroot_project_monitors_host',
      },
      {
        _key: 'uuid-g1|has|uuid-2',
        _type: 'feroot_project_folder_has_project',
        _class: 'HAS',
        _fromEntityKey: 'uuid-g1',
        _toEntityKey: 'uuid-2',
        displayName: 'HAS',
      },
      {
        _key: 'uuid-2|includes|pg:pg-uuid-1',
        _type: 'feroot_project_includes_pageguard_project',
        _class: 'INCLUDES',
        _fromEntityKey: 'uuid-2',
        _toEntityKey: 'pg:pg-uuid-1',
        displayName: 'INCLUDES',
      },
    ]);
  });

  test('creates target hosts if configured', async () => {
    let items: FerootProject[] = [
      {
        id: 'abc',
        name: 'name-1',
        serviceUuid: 'service-1',
        status: 1,
        urls: ['https://www.feroot.com'],
        uuid: 'uuid-1',
      },
    ];

    const { client, context } = createContextMocks(
      <APIClient>{
        async getProjects(iteratee) {
          for (let item of items) await iteratee(item);
        },
      },
      {
        createTargetHosts: true,
      },
    );

    await step.executionHandler(context);

    expect(client.getProjects).toBeCalledTimes(1);

    expect(context.jobState.collectedEntities.length).toBe(1);
    expect(context.jobState.collectedRelationships).toMatchObject([
      {
        _class: 'MONITORS',
        _mapping: {
          relationshipDirection: 'FORWARD',
          sourceEntityKey: 'uuid-1',
          targetFilterKeys: [['_class', 'hostname']],
          targetEntity: {
            _class: 'Host',
            _type: 'host',
            hostname: 'www.feroot.com',
            displayName: 'www.feroot.com',
          },
          skipTargetCreation: false,
        },
        displayName: 'MONITORS',
        _key: 'uuid-1|monitors|FORWARD:_class=Host:hostname=www.feroot.com',
        _type: 'feroot_project_monitors_host',
      },
    ]);
  });
});
