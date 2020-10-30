import { RelationshipClass } from '@jupiterone/integration-sdk-core';

export const Steps = {
  USERS: 'fetch-users',
  GROUPS: 'fetch-user-groups',
  PROJECTS: 'fetch-projects',
  PROJECT_FOLDERS: 'fetch-project-folders',
  PAGEGUARD_PROJECTS: 'fetch-pageguard-projects',
  ALERTS: 'fetch-alerts',
};

export const Entities = {
  PROJECT: {
    resourceName: 'Inspector Project',
    _type: 'feroot_project',
    _class: 'Project',
  },
  PROJECT_FOLDER: {
    resourceName: 'Project Folder',
    _type: 'feroot_project_folder',
    _class: 'Group',
  },
  USER: {
    resourceName: 'User',
    _type: 'feroot_user',
    _class: 'User',
  },
  GROUP: {
    resourceName: 'User Group',
    _type: 'feroot_user_group',
    _class: 'UserGroup',
  },
  DOMAIN: {
    resourceName: 'Target Domain',
    _type: 'web_app_domain',
    _class: ['Application'],
  },
  PAGEGUARD_PROJECT: {
    resourceName: 'PageGuard Project',
    _type: 'feroot_pageguard_project',
    _class: 'Project',
  },
  ALERT: {
    resourceName: 'Alert',
    _type: 'feroot_alert',
    _class: 'Finding',
  },
};

export const Relationships = {
  GROUP_HAS_USER: {
    _type: 'feroot_user_group_has_user',
    sourceType: Entities.GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.USER._type,
  },
  PROJECT_MONITORS_DOMAIN: {
    _type: 'feroot_project_monitors_web_app_domain',
    sourceType: Entities.PROJECT._type,
    _class: RelationshipClass.MONITORS,
    targetType: Entities.DOMAIN._type,
  },
  GROUP_HAS_PROJECT_FOLDER: {
    _type: 'feroot_user_group_has_project_folder',
    sourceType: Entities.GROUP._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.PROJECT_FOLDER._type,
  },
  PROJECT_GENERATED_ALERT: {
    _type: 'feroot_project_generated_alert',
    sourceType: Entities.PROJECT._type,
    _class: RelationshipClass.GENERATED,
    targetType: Entities.ALERT._type,
  },
  PROJECT_FOLDER_HAS_PROJECT: {
    _type: 'feroot_project_folder_has_project',
    sourceType: Entities.PROJECT_FOLDER._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.PROJECT._type,
  },
  PROJECT_CONTAINS_PAGEGUARD_PROJECT: {
    _type: 'feroot_project_contains_pageguard_project',
    sourceType: Entities.PROJECT._type,
    _class: RelationshipClass.CONTAINS,
    targetType: Entities.PAGEGUARD_PROJECT._type,
  },
};
