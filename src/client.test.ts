import { Recording } from '@jupiterone/integration-sdk-testing';
import { APIClient } from './client';
import { initRecording } from '../tests/helpers';
import {
  FerootAlert,
  FerootPageguardProject,
  FerootProject,
  FerootProjectFolder,
  FerootUserGroup,
  FerootUser,
} from './types-feroot';
import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';
import dotenv from 'dotenv';

// load environment variables for tests
dotenv.config();

function getApiClient(customApiKey?: string): APIClient {
  return new APIClient({
    ferootApiKey: customApiKey || process.env.FEROOT_API_KEY || 'invalid-key',
    ferootBaseUrl: 'http://app.feroot.test',
  });
}

let recording: Recording | null;

afterEach(async () => {
  if (recording) {
    await recording.stop();
    recording = null;
  }
});

describe('Feroot API Client', () => {
  test('should verify valid api key', async () => {
    recording = initRecording();
    const client = getApiClient();

    await expect(client.verifyAuthentication()).resolves.not.toThrow();
  });

  test('should reject invalid api key', async () => {
    recording = initRecording('fake-key');
    const client = getApiClient('fake-key');

    await expect(client.verifyAuthentication()).rejects.toThrowError(
      IntegrationProviderAuthenticationError,
    );
  });

  test('should return all alerts', async () => {
    recording = initRecording();
    const client = getApiClient();

    const items: FerootAlert[] = [];
    await client.getProjectAlerts(items.push.bind(items), {
      activeOnly: false,
    });

    expect(items.length).toEqual(3);
    expect(items.filter((x) => x.state === 1).length).toBeGreaterThan(0);
    expect(items.filter((x) => x.state === 2).length).toBeGreaterThan(0);
  });

  test('should return only unresolved alerts', async () => {
    recording = initRecording();

    let client = getApiClient();

    const items: FerootAlert[] = [];
    await client.getProjectAlerts(items.push.bind(items), {
      activeOnly: true,
    });

    expect(items.length).toEqual(2);
    expect(items.filter((x) => x.state === 1).length).toBeGreaterThan(0);
    expect(items.filter((x) => x.state === 2).length).toBe(0);
  });

  test('should return PageGuard projects', async () => {
    recording = initRecording();
    const client = getApiClient();

    const items: FerootPageguardProject[] = [];
    await client.getPageguardProjects(items.push.bind(items));

    expect(items.length).toEqual(1);
    items.forEach((item) => {
      expect(Object.keys(item)).toEqual(['id', 'uuid', 'name', 'activatedAt']);
    });
  });

  test('should return all projects', async () => {
    recording = initRecording();
    const client = getApiClient();

    const items: FerootProject[] = [];
    await client.getProjects(items.push.bind(items));

    expect(items.length).toEqual(2);
    items.forEach((item) => {
      expect(Object.keys(item)).toEqual(
        expect.arrayContaining(['uuid', 'name', 'urls', 'status']),
      );
    });
    expect(items.filter((x) => !!x.projectGroup).length).toBeGreaterThan(0);
    expect(items.filter((x) => !x.projectGroup).length).toBeGreaterThan(0);
  });

  test('should return all project folders', async () => {
    recording = initRecording();
    const client = getApiClient();

    const items: FerootProjectFolder[] = [];
    await client.getProjectFolders(items.push.bind(items));

    expect(items.length).toEqual(2);
    items.forEach((item) => {
      expect(Object.keys(item)).toEqual(
        expect.arrayContaining(['id', 'uuid', 'name', 'userGroups']),
      );
    });
  });

  test('should return all user groups', async () => {
    recording = initRecording();
    const client = getApiClient();

    const items: FerootUserGroup[] = [];
    await client.getUserGroups(items.push.bind(items));

    expect(items.length).toEqual(2);
    items.forEach((item) => {
      expect(Object.keys(item)).toEqual(
        expect.arrayContaining(['id', 'uuid', 'name']),
      );
    });
  });

  test('should return all users', async () => {
    recording = initRecording();
    const client = getApiClient();

    const items: FerootUser[] = [];
    await client.getUsers(items.push.bind(items));

    expect(items.length).toEqual(2);
    items.forEach((item) => {
      let props = [
        'id',
        'uuid',
        'email',
        'phone',
        'firstName',
        'lastName',
        'roles',
        'userGroups',
      ];
      expect(Object.keys(item)).toEqual(expect.arrayContaining(props));
    });
    expect(items.filter((x) => x.userGroups.length > 0).length).toBeGreaterThan(
      0,
    );
    expect(items.filter((x) => x.roles.length > 0).length).toBeGreaterThan(0);
  });
});
