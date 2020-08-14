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
        serviceUuid: 'service-uuid-1',
        status: 1,
        urls: ['https://www.feroot.com', 'https://app.feroot.com'],
        uuid: 'project-uuid-1',
      },
      {
        id: 'abc-2',
        name: 'name-2',
        serviceUuid: 'service-uuid-1',
        status: 3, // paused
        urls: ['https://www.google.com'],
        uuid: 'project-uuid-2',
        pageguardUuid: 'pageguard-uuid-1',
        projectGroup: 'group-uuid-1',
      },
    ];

    const { client, context } = createContextMocks(<APIClient>{
      async getProjects(iteratee) {
        for (let item of items) await iteratee(item);
      },
    });

    await step.executionHandler(context);

    expect(client.getProjects).toBeCalledTimes(1);

    expect(context.jobState.collectedEntities).toMatchObject([
      {
        id: 'abc',
        name: 'name-1',
        status: 'Active',
        _type: 'feroot_project',
        _class: ['Project'],
        _key: 'project-uuid-1',
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
        name: 'feroot.com',
        _key: 'web-app-domain:feroot.com',
        _type: 'web_app_domain',
        _class: ['Application'],
        displayName: 'feroot.com',
        _rawData: [
          {
            name: 'default',
            rawData: {
              name: 'feroot.com',
            },
          },
        ],
      },
      {
        id: 'abc-2',
        name: 'name-2',
        status: 'Paused',
        _type: 'feroot_project',
        _class: ['Project'],
        _key: 'project-uuid-2',
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
      {
        name: 'google.com',
        _key: 'web-app-domain:google.com',
        _type: 'web_app_domain',
        _class: ['Application'],
        displayName: 'google.com',
        _rawData: [
          {
            name: 'default',
            rawData: {
              name: 'google.com',
            },
          },
        ],
      },
    ]);
    expect(context.jobState.collectedRelationships).toMatchObject([
      {
        _key: 'project-uuid-1|monitors|web-app-domain:feroot.com',
        _type: 'feroot_project_monitors_web_app_domain',
        _class: 'MONITORS',
        _fromEntityKey: 'project-uuid-1',
        _toEntityKey: 'web-app-domain:feroot.com',
        displayName: 'MONITORS',
      },
      {
        _key: 'project-uuid-2|monitors|web-app-domain:google.com',
        _type: 'feroot_project_monitors_web_app_domain',
        _class: 'MONITORS',
        _fromEntityKey: 'project-uuid-2',
        _toEntityKey: 'web-app-domain:google.com',
        displayName: 'MONITORS',
      },
      {
        _key: 'group-uuid-1|has|project-uuid-2',
        _type: 'feroot_project_folder_has_project',
        _class: 'HAS',
        _fromEntityKey: 'group-uuid-1',
        _toEntityKey: 'project-uuid-2',
        displayName: 'HAS',
      },
      {
        _key: 'project-uuid-2|contains|pg:pageguard-uuid-1',
        _type: 'feroot_project_contains_pageguard_project',
        _class: 'CONTAINS',
        _fromEntityKey: 'project-uuid-2',
        _toEntityKey: 'pg:pageguard-uuid-1',
        displayName: 'CONTAINS',
      },
    ]);
  });

  test('does not create duplicated "web_app_domain" entities', async () => {
    let items: FerootProject[] = [
      {
        id: 'abc123456789-1',
        name: 'name-1',
        serviceUuid: 'service-uuid-1',
        status: 1,
        urls: ['https://www.feroot.com'],
        uuid: 'project-uuid-1',
      },
      {
        id: 'abc123456789-2',
        name: 'name-2',
        serviceUuid: 'service-uuid-1',
        status: 1,
        urls: ['https://app.feroot.com'],
        uuid: 'project-uuid-2',
      },
    ];

    const { context } = createContextMocks(<APIClient>{
      async getProjects(iteratee) {
        for (let item of items) await iteratee(item);
      },
    });

    await step.executionHandler(context);

    expect(
      context.jobState.collectedEntities.filter(
        (x) => x._type === 'web_app_domain',
      ).length,
    ).toBe(1);
  });
});
