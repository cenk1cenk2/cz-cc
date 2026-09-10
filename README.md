# @cenk1cenk2/cz-cc

[![pipeline status](https://gitlab.kilic.dev/libraries/cz-cc/badges/master/pipeline.svg)](https://gitlab.kilic.dev/libraries/cz-cc/-/commits/master) [![Version](https://img.shields.io/npm/v/@cenk1cenk2/cz-cc.svg)](https://npmjs.org/package/@cenk1cenk2/cz-cc) [![Downloads/week](https://img.shields.io/npm/dw/@cenk1cenk2/cz-cc.svg)](https://npmjs.org/package/@cenk1cenk2/cz-cc) [![Dependencies](https://img.shields.io/librariesio/release/npm/@cenk1cenk2/cz-cc)](https://npmjs.org/package/@cenk1cenk2/cz-cc) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

![Demo](./demo/demo.gif)

<!-- toc -->

- [Description](#description)
- [Usage](#usage)
- [Configuration](#configuration)
  - [package.json](#packagejson)
  - [Environment Variables](#environment-variables)
- [Breaking Changes](#breaking-changes)
  - [Migration to v3](#migration-to-v3)
- [Commitlint](#commitlint)

<!-- tocstop -->

## Description

This is a direct fork of [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog), while it swaps `inquirer` for `enquirer` for speed and adds autocomplete to commit types as well as reducing overall questions and making many optional.

## Usage

- Install commitizen. Either globally or in the project.

```shell
# yarn
yarn global add commitizen
# npm
npm install -g commitizen
```

- Initiate this adapter in a project. If already initiated you can add the `--force` flag to swap this adapter with the older one.
  - Currently has a bit of problems with yarn workspaces do to `commitizen`.

```shell
# yarn
commitizen init @cenk1cenk2/cz-cc --yarn --dev
# npm
commitizen init @cenk1cenk2/cz-cc --dev
```

- Add git-hooks.

```json
{
  "simple-git-hooks": {
    "prepare-commit-msg": "[ -t 1 ] && exec < /dev/tty && git cz --hook || true"
  }
}
```

- Add [commitlint](https://github.com/conventional-changelog/commitlint#readme) if desired.

## Configuration

Install the adapter by utilizing global commitizen installation.

Configuration settings are down below.

### package.json

Like commitizen, you specify the configuration of cz-conventional-changelog through the package.json's `config.commitizen` key.

```json5
{
// ...  default values
    "config": {
        "commitizen": {
            "path": "./node_modules/@cenk1cenk2/cz-cc",
            "preset": "conventionalcommits",
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

`preset` selects how breaking changes are prompted for and rendered, either `conventionalcommits` (default) or `angular`. See [Breaking Changes](#breaking-changes).

### Environment Variables

The following environment varibles can be used to override any default configuration or package.json based configuration.

- CZ_PRESET = preset
- CZ_TYPE = defaultType
- CZ_SCOPE = defaultScope
- CZ_SUBJECT = defaultSubject
- CZ_BODY = defaultBody
- CZ_MAX_HEADER_WIDTH = maxHeaderWidth
- CZ_MAX_LINE_WIDTH = maxLineWidth

## Breaking Changes

The `preset` configuration decides how a breaking change is captured, which has to match the preset the release tooling analyzes commits with.

- `conventionalcommits` (**default**) asks whether the commit is a breaking change right after the description and appends the `!` marker after the type and the optional scope, as in `feat(api)!: drop the legacy token endpoint`. The `BREAKING CHANGE` footer stays available through the additional actions and both may be used together, since the specification treats the marker and the footer as independent signals.
- `angular` drops the marker prompt entirely and signals breaking changes through the `BREAKING CHANGE` footer alone, which is the behaviour of every release before v3.

### Migration to v3

`conventionalcommits` became the default in v3, so commits made through the adapter can now carry the `!` marker in the header. Two things to check:

- The release tooling has to analyze commits with the `conventionalcommits` preset, otherwise the `!` marker is not read as a major bump. `@semantic-release/commit-analyzer` and `commitlint` both take a `preset` of their own.
- `header-max-length` counts the extra character, and any tooling matching commit headers with a custom regular expression has to allow the `!` before the colon.

To keep the previous behaviour, pin the preset back:

```json5
{
  "config": {
    "commitizen": {
      "preset": "angular"
    }
  }
}
```

## Commitlint

If using the [commitlint](https://github.com/conventional-changelog/commitlint) js library, the "maxHeaderWidth" configuration property will default to the configuration of the "header-max-length" rule instead of the hard coded value of 100. This can be overwritten by setting the 'maxHeaderWidth' configuration in package.json or the CZ_MAX_HEADER_WIDTH environment variable.
