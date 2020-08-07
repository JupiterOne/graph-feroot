# Integration with JupiterOne

## Setup

JupiterOne provides a managed integration for Feroot. The integration connects
directly to Feroot APIs to obtain projects, alerts, users and other information.
To conigure this integration you should have an account in Feroot and create an
API key for accessing to API.

To create an account in Feroot just sign up on
[feroot.com](https://www.feroot.com). To create an API key go to `Settings` ->
`Account` -> `Developer` and click `Create new API key`. The new item will be
added to `List of API keys` table. Click on `Reveal API key` and copy the key to
use in the integration.
[TODO: describe process involving J1 integration settings in Feroot app]()

## Data Model

### Entities

The following entity resources are ingested when the integration runs:

| Resources                           | \_type of the Entity       | \_class of the Entity |
| ----------------------------------- | -------------------------- | --------------------- |
| User                                | `feroot_user`              | `User`                |
| User Group                          | `feroot_user_group`        | `UserGroup`           |
| Project Folder                      | `feroot_project_folder`    | `Group`               |
| Inspector Project                   | `feroot_project`           | `Project`             |
| PageGuard Project                   | `feroot_pageguard_project` | `Project`             |
| Alert                               | `feroot_alert`             | `Incident`            |
| Target Host [\*](#target-host-note) | `host`                     | `Host`                |

<a name="target-host-note">\*</a>`Target Host` entities are generated only if
`createTargetHosts` configuration option is turned on.

### Relationships

The following relationships are created/mapped:

| From                    | Edge          | To                         |
| ----------------------- | ------------- | -------------------------- |
| `feroot_user_group`     | **HAS**       | `feroot_user`              |
| `feroot_user_group`     | **HAS**       | `feroot_project_folder`    |
| `feroot_project`        | **MONITORS**  | `Host`                     |
| `feroot_project_folder` | **HAS**       | `feroot_project`           |
| `feroot_project`        | **INCLUDES**  | `feroot_pageguard_project` |
| `feroot_project`        | **GENERATED** | `feroot_alert`             |
