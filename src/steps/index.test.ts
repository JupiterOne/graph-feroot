import * as index from './index';

describe('Steps index', () => {
  test('includes all the steps', () => {
    expect(Object.keys(index)).toMatchObject([
      'fetchUsers',
      'fetchUserGroups',
      'fetchProjectFolders',
      'fetchProjects',
      'fetchAlerts',
      'fetchPageguardProjects',
    ]);
  });

  test('all steps are unique', () => {
    const valuesSet = new Set(Object.values(index));
    expect(Object.keys(index).length).toBe(valuesSet.size);
  });
});
