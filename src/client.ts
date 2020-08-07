const API_BASE_URL = 'http://app.feroot.test';

import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';

import axios from 'axios';

import { IntegrationConfig } from './types';
import {
  FerootProjectsListResult,
  FerootUser,
  FerootUserGroup,
  FerootProjectFolder,
  FerootProject,
  FerootAlert,
  FerootPageguardProject,
} from './types-feroot';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

export type AlertsFilter = {
  activeOnly?: boolean;
  projectUuid?: string;
};

/**
 * Provides an API client for Feroot API
 */
export class APIClient {
  private _config: IntegrationConfig;

  constructor(readonly config: IntegrationConfig) {
    this._config = config;
  }

  private async getData<T>(path: string, args?: object): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Feroot-JupiterOne Integration',
          'x-api-key': this._config.ferootApiKey,
        },
        params: args,
      });
      return data;
    } catch (err) {
      const response = err.response || {};
      throw Object.assign(new Error(err.message), {
        url: url,
        status: response.status || err.status || 'UNKNOWN',
        statusText: response.statusText || err.statusText || 'UNKNOWN',
      });
    }
  }

  public async verifyAuthentication(): Promise<void> {
    try {
      await this.getData('/api/v1/account/settings');
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: err.url,
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  public async getUsers(iteratee: ResourceIteratee<FerootUser>): Promise<void> {
    let items = await this.getData<FerootUser[]>('/api/v1/account/users');
    for (let item of items) {
      await iteratee(item);
    }
  }

  public async getProjects(
    iteratee: ResourceIteratee<FerootProject>,
  ): Promise<void> {
    let opts = {
      sortField: 'id',
      desc: false,
      skip: 0,
      limit: 100,
    };
    let hasMore = true;
    do {
      let data = await this.getData<FerootProjectsListResult>(
        '/api/v2/monitoring/projects/list',
        opts,
      );
      for (let item of data.items) {
        await iteratee(item);
      }
      hasMore = data.hasMore;
      opts.skip += data.items.length;
    } while (hasMore);
  }

  public async getPageguardProjects(
    iteratee: ResourceIteratee<FerootPageguardProject>,
  ): Promise<void> {
    let items = await this.getData<any[]>('/api/v1/pageguard/projects');
    for (let item of items) {
      await iteratee(item);
    }
  }

  public async getProjectAlerts(
    iteratee: ResourceIteratee<FerootAlert>,
    filter?: AlertsFilter,
  ): Promise<void> {
    let { projectUuid, activeOnly } = filter || {};
    let items = await this.getData<any[]>(
      '/api/v1/monitoring/projects/alerts',
      {
        includeEventData: false,
        includeEventTitle: true,
        state: activeOnly ? 1 : undefined,
        projectUuid: projectUuid,
      },
    );
    for (let item of items) {
      await iteratee(item);
    }
  }

  public async getUserGroups(
    iteratee: ResourceIteratee<FerootUserGroup>,
  ): Promise<void> {
    let items = await this.getData<any[]>('/api/v1/account/user-groups');
    for (let item of items) {
      await iteratee(item);
    }
  }

  public async getProjectFolders(
    iteratee: ResourceIteratee<FerootProjectFolder>,
  ): Promise<void> {
    let items = await this.getData<any[]>('/api/v1/account/project-groups');
    for (let item of items) {
      await iteratee(item);
    }
  }
}

export function createAPIClient(config: IntegrationConfig): APIClient {
  return new APIClient(config);
}
