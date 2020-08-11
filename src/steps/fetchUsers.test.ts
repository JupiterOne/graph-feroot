import { FerootUser } from '../types-feroot';
import { APIClient } from '../client';
import { createContextMocks } from '../../tests/helpers';
jest.mock('../client');

import step from './fetchUsers';

describe('User Groups fetching', () => {
  test('creates entities and relationships', async () => {
    let items: FerootUser[] = [
      {
        id: 'abc-1',
        email: 'user@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123',
        roles: ['admin', 'owner'],
        userGroups: [],
        uuid: 'uuid-1',
      },
      {
        id: 'abc-2',
        email: 'user2@gmail.com',
        firstName: 'Daniel',
        lastName: 'Smith',
        phone: '',
        roles: [],
        userGroups: ['uuid-g1', 'uuid-g2'],
        uuid: 'uuid-2',
      },
    ];

    const { client, context } = createContextMocks(<APIClient>{
      async getUsers(iteratee) {
        for (let item of items) await iteratee(item);
      },
    });

    await step.executionHandler(context);

    expect(client.getUsers).toBeCalledTimes(1);

    expect(context.jobState.collectedEntities).toMatchObject([
      {
        id: 'abc-1',
        email: 'user@gmail.com',
        _type: 'feroot_user',
        _class: ['User'],
        _key: 'uuid-1',
        displayName: 'John Doe',
        name: 'user@gmail.com',
        username: 'user@gmail.com',
        _rawData: [
          {
            name: 'default',
            rawData: items[0],
          },
        ],
      },
      {
        id: 'abc-2',
        email: 'user2@gmail.com',
        _type: 'feroot_user',
        _class: ['User'],
        _key: 'uuid-2',
        displayName: 'Daniel Smith',
        name: 'user2@gmail.com',
        username: 'user2@gmail.com',
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
        _type: 'feroot_user_group_has_user',
        _class: 'HAS',
        _fromEntityKey: 'uuid-g1',
        _toEntityKey: 'uuid-2',
        displayName: 'HAS',
      },
      {
        _key: 'uuid-g2|has|uuid-2',
        _type: 'feroot_user_group_has_user',
        _class: 'HAS',
        _fromEntityKey: 'uuid-g2',
        _toEntityKey: 'uuid-2',
        displayName: 'HAS',
      },
    ]);
  });
});
