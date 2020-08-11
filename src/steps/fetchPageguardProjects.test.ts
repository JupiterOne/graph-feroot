import { FerootPageguardProject } from '../types-feroot';
import { APIClient } from '../client';
import { createContextMocks } from '../../tests/helpers';
jest.mock('../client');

import step from './fetchPageguardProjects';

describe('PageGuard Projects fetching', () => {
  test('creates entities and relationships', async () => {
    let items: FerootPageguardProject[] = [
      {
        id: 'abc',
        name: 'name-1',
        uuid: 'uuid-1',
        activatedAt: 1597167323436,
      },
      {
        id: 'abc-2',
        name: 'name-2',
        uuid: 'uuid-2',
        activatedAt: 1597166323436,
      },
    ];

    const { client, context } = createContextMocks(<APIClient>{
      async getPageguardProjects(iteratee) {
        for (let item of items) await iteratee(item);
      },
    });

    await step.executionHandler(context);

    expect(client.getPageguardProjects).toBeCalledTimes(1);

    expect(context.jobState.collectedEntities).toMatchObject([
      {
        id: 'abc',
        name: 'name-1',
        _type: 'feroot_pageguard_project',
        _class: ['Project'],
        _key: 'pg:uuid-1',
        displayName: 'name-1',
        activatedAt: 1597167323436,
        active: true,
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
        _type: 'feroot_pageguard_project',
        _class: ['Project'],
        _key: 'pg:uuid-2',
        displayName: 'name-2',
        activatedAt: 1597166323436,
        active: true,
        _rawData: [
          {
            name: 'default',
            rawData: items[1],
          },
        ],
      },
    ]);
    expect(context.jobState.collectedRelationships).toMatchObject([]);
  });
});
