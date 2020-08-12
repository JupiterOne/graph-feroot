export interface FerootUser {
  id: string;
  uuid: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  roles: string[];
  userGroups: string[];
}

export interface FerootUserGroup {
  id: string;
  uuid: string;
  name: string;
}

export interface FerootProjectFolder {
  id: string;
  uuid: string;
  name: string;
  userGroups: string[];
}

export interface FerootProjectsListResult {
  hasMore: boolean;
  items: FerootProject[];
}

export interface FerootProject {
  id: string;
  uuid: string;
  serviceUuid: string;
  name: string;
  urls: string[];
  scope?: string;
  pagesLimit?: number;
  scanPeriodDays?: number;
  nextScheduleAt?: number;
  status: number;
  authentication?: string;
  scanSpecifiedUrlsOnly?: boolean;
  scanFromLocation?: string;
  pageguardUuid?: string;
  projectGroup?: string;
  createdAt?: number;
  updatedAt?: number;
  screenshotUrl?: string;
  defaultSession?: {
    status: string;
    pagesCount?: number;
    pagesDone?: number;
  };
}

export interface FerootAlert {
  id: string;
  projectUuid: string;
  alertType: string;
  state: number;
  eventsCount: number;
  title?: string;
}

export interface FerootPageguardProject {
  id: string;
  uuid: string;
  name: string;
  // timestamp
  activatedAt?: number;
}
