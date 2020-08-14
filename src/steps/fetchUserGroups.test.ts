import { FerootUserGroup } from '../types-feroot';
import { APIClient } from '../client';
import { createContextMocks } from '../../tests/helpers';
jest.mock('../client');

import step from './fetchUserGroups';

describe('User Groups fetching', () => {
  test('creates entities and relationships', async () => {
    let items: FerootUserGroup[] = [
      {
        id: 'abc',
        name: 'name-1',
        uuid: 'usergroup-uuid-1',
      },
      {
        id: 'abc-2',
        name: 'name-2',
        uuid: 'usergroup-uuid-2',
      },
    ];

    const { client, context } = createContextMocks(<APIClient>{
      async getUserGroups(iteratee) {
        for (let item of items) await iteratee(item);
      },
    });

    await step.executionHandler(context);

    expect(client.getUserGroups).toBeCalledTimes(1);

    expect(context.jobState.collectedEntities).toMatchObject([
      {
        id: 'abc',
        name: 'name-1',
        _type: 'feroot_user_group',
        _class: ['UserGroup'],
        _key: 'usergroup-uuid-1',
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
        _type: 'feroot_user_group',
        _class: ['UserGroup'],
        _key: 'usergroup-uuid-2',
        displayName: 'name-2',
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
