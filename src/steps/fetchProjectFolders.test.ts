import { FerootProjectFolder } from '../types-feroot';
import { APIClient } from '../client';
import { createContextMocks } from '../../tests/helpers';
jest.mock('../client');

import step from './fetchProjectFolders';

describe('Project Folders fetching', () => {
  test('creates entities and relationships', async () => {
    let items: FerootProjectFolder[] = [
      {
        id: 'abc',
        name: 'name-1',
        uuid: 'uuid-1',
        userGroups: [],
      },
      {
        id: 'abc-2',
        name: 'name-2',
        uuid: 'uuid-2',
        userGroups: ['uuid-g1', 'uuid-g2'],
      },
    ];

    const { client, context } = createContextMocks(<APIClient>{
      async getProjectFolders(iteratee) {
        for (let item of items) await iteratee(item);
      },
    });

    await step.executionHandler(context);

    expect(client.getProjectFolders).toBeCalledTimes(1);

    expect(context.jobState.collectedEntities).toMatchObject([
      {
        id: 'abc',
        name: 'name-1',
        _type: 'feroot_project_folder',
        _class: ['Group'],
        _key: 'uuid-1',
        displayName: 'name-1',
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
        _type: 'feroot_project_folder',
        _class: ['Group'],
        _key: 'uuid-2',
        displayName: 'name-2',
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
        _key: 'uuid-g1|has|uuid-2',
        _type: 'feroot_user_group_has_project_folder',
        _class: 'HAS',
        _fromEntityKey: 'uuid-g1',
        _toEntityKey: 'uuid-2',
        displayName: 'HAS',
      },
      {
        _key: 'uuid-g2|has|uuid-2',
        _type: 'feroot_user_group_has_project_folder',
        _class: 'HAS',
        _fromEntityKey: 'uuid-g2',
        _toEntityKey: 'uuid-2',
        displayName: 'HAS',
      },
    ]);
  });
});
