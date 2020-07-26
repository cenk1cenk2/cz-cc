# @cenk1cenk2/cz-cc

[![Build Status](https://drone.kilic.dev/api/badges/cenk1cenk2/cz-cc/status.svg)](https://drone.kilic.dev/cenk1cenk2/cz-cc) [![Version](https://img.shields.io/npm/v/@cenk1cenk2/cz-cc.svg)](https://npmjs.org/package/@cenk1cenk2/cz-cc) [![Downloads/week](https://img.shields.io/npm/dw/@cenk1cenk2/cz-cc.svg)](https://npmjs.org/package/@cenk1cenk2/cz-cc) [![Dependencies](https://img.shields.io/librariesio/release/npm/@cenk1cenk2/cz-cc)](https://npmjs.org/package/@cenk1cenk2/cz-cc) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

![Demo](./demo/demo.gif)

<!-- toc -->

- [Description](#description)
- [Usage](#usage)
- [Configuration](#configuration)
  - [package.json](#packagejson)
  - [Environment variables](#environment-variables)
  - [Commitlint](#commitlint)

<!-- tocstop -->

# Description

This is a direct fork of [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog), while it swaps `inquirer` for `enquirer` for speed and adds auto compelete to commit types as well as reducing overal questions and making many optional.

# Usage

- Install commitizen. Either globally or in the project.

```shell
# yarn
yarn global add commitizen
# npm
npm install -g commitizen
```

- Initiate this adapter in a project. If already initiated you can add `--force` flag to swap this adapter with the older one.
  - Currently has a bit of problems with yarn workspaces do to `commitizen`.

```shell
# yarn
commitizen init @cenk1cenk2/cz-cc --yarn --dev
# npm
commitizen init @cenk1cenk2/cz-cc --dev
```

- Add [husky](https://github.com/typicode/husky) hooks for convienence and quality assurance.

```json
{
  "husky": {
    "hooks": {
      "prepare-commit-msg": "exec < /dev/tty && git cz --hook || true"
    }
  }
}
```

- Add [commit-lint](https://github.com/conventional-changelog/commitlint#readme) if desired.

# Configuration

Install the adapter by utilizing global commitizen installation.

Configuration settings are down below.

## package.json

Like commitizen, you specify the configuration of cz-conventional-changelog through the package.json's `config.commitizen` key.

```json5
{
// ...  default values
    "config": {
        "commitizen": {
            "path": "./node_modules/@cenk1cenk2/cz-cc",
            "maxHeaderWidth": 100,
            "maxLineWidth": 100,
            "defaultType": "",
            "defaultScope": "",
            "defaultSubject": "",
            "defaultBody": "",
            "defaultIssues": "",
            "types": {
              ...
              "feat": {
                "description": "A new feature",
                "title": "Features"
              },
              ...
            }
        }
    }
// ...
}
```

## Environment variables

The following environment varibles can be used to override any default configuration or package.json based configuration.

- CZ_TYPE = defaultType
- CZ_SCOPE = defaultScope
- CZ_SUBJECT = defaultSubject
- CZ_BODY = defaultBody
- CZ_MAX_HEADER_WIDTH = maxHeaderWidth
- CZ_MAX_LINE_WIDTH = maxLineWidth

## Commitlint

If using the [commitlint](https://github.com/conventional-changelog/commitlint) js library, the "maxHeaderWidth" configuration property will default to the configuration of the "header-max-length" rule instead of the hard coded value of 100. This can be ovewritten by setting the 'maxHeaderWidth' configuration in package.json or the CZ_MAX_HEADER_WIDTH environment variable.
