# Integration with JupiterOne

## Setup

JupiterOne provides a managed integration for Feroot. The integration connects
directly to Feroot APIs to obtain projects, alerts, users and other information.
To conigure this integration you should have an account in Feroot and create an
API key for accessing to API.

To create an account in Feroot just sign up on
[feroot.com](https://www.feroot.com). To get access to the API Key management
functionality the `PRO` plan subscription is required. You can start a free
trial of `PRO` plan by clicking on `Start PRO trial` link in your account.

To create an API key go to `Settings` -> `Account` -> `Developer` and click
`Create new API key`. Select `Admin Read-only` role for the new key. The new
item will be added to `List of API keys` table. Click on `Reveal API key` and
copy the key to use in the integration.

<!-- {J1_DOCUMENTATION_MARKER_START} -->
<!--
********************************************************************************
NOTE: ALL OF THE FOLLOWING DOCUMENTATION IS GENERATED USING THE
"j1-integration document" COMMAND. DO NOT EDIT BY HAND! PLEASE SEE THE DEVELOPER
DOCUMENTATION FOR USAGE INFORMATION:

https://github.com/JupiterOne/sdk/blob/master/docs/integrations/development.md
********************************************************************************
-->

## Data Model

### Entities

The following entities are created:

| Resources         | Entity `_type`             | Entity `_class` |
| ----------------- | -------------------------- | --------------- |
| Alert             | `feroot_alert`             | `Finding`       |
| Inspector Project | `feroot_project`           | `Project`       |
| PageGuard Project | `feroot_pageguard_project` | `Project`       |
| Project Folder    | `feroot_project_folder`    | `Group`         |
| Target Domain     | `web_app_domain`           | `Application`   |
| User              | `feroot_user`              | `User`          |
| User Group        | `feroot_user_group`        | `UserGroup`     |

### Relationships

The following relationships are created/mapped:

| Source Entity `_type`   | Relationship `_class` | Target Entity `_type`      |
| ----------------------- | --------------------- | -------------------------- |
| `feroot_project`        | **CONTAINS**          | `feroot_pageguard_project` |
| `feroot_project_folder` | **HAS**               | `feroot_project`           |
| `feroot_project`        | **GENERATED**         | `feroot_alert`             |
| `feroot_project`        | **MONITORS**          | `web_app_domain`           |
| `feroot_user_group`     | **HAS**               | `feroot_project_folder`    |
| `feroot_user_group`     | **HAS**               | `feroot_user`              |

<!--
********************************************************************************
END OF GENERATED DOCUMENTATION AFTER BELOW MARKER
********************************************************************************
-->
<!-- {J1_DOCUMENTATION_MARKER_END} -->
