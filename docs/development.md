# Development

This integration uses API initially designated to use with Feroot Front End
applications. By that reason there is no public API documentation for used
endpoints. Nevertheless, here we briefly describe used API.

Feroot API is a regular REST API operating with JSON data format. To access
non-public endpoints each request should include `x-api-key` header containing
Feroot API key (see **Provider account setup** section). Most of endpoints we
use in this integration are `GET` endpoints providing a list of items. See
`APIClient` class in [../src/client.ts](../src/client.ts) containing wrappers
for all the API we use in this integration. Basically all the methods use a
`getData` function helping to simplify requests to Feroot. Feroot types
definition for data returning from the API are located in
[../src/types-feroot.ts](../src/types-feroot.ts) file.

## Prerequisites

No extra prerequisites required than covered in the [README](../README.md) file.

## Provider account setup

To create an account in Feroot just sign up on
[feroot.com](https://www.feroot.com). To create an API key go to `Settings` ->
`Account` -> `Developer` and click `Create new API key`. The new item will be
added to `List of API keys` table. Click on `Reveal API key` and copy the key to
use in the integration.
[TODO: describe process involving J1 integration settings in Feroot app]()

## Authentication and configuration

To authentificate requests to Feroot an API Key with administrative access is
required. This key should be provided in `ferootApiKey` configuration field. See
the section above for the instruction of how to obtain the key.

See [../src/instanceConfigFields.ts](../src/instanceConfigFields.ts) and
[../src/types.ts](../src/types.ts) for the latest version of configuration
parameters.
