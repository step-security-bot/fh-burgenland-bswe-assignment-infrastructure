# FH Burgenland: BSWE - Assignment Infrastructure

[![Build status](https://img.shields.io/github/actions/workflow/status/muhlba91/github-infrastructure/pipeline.yml?style=for-the-badge)](https://github.com/muhlba91/github-infrastructure/actions/workflows/pipeline.yml)
[![License](https://img.shields.io/github/license/muhlba91/github-infrastructure?style=for-the-badge)](LICENSE.md)

This repository contains the automation for the required assignment infrastructure for the FH Burgenland "Softwaremanagent II" course using [Pulumi](http://pulumi.com).

---

## Requirements

- [NodeJS](https://nodejs.org/en), and [yarn](https://yarnpkg.com)
- [Pulumi](https://www.pulumi.com/docs/install/)

## Creating the Infrastructure

To create the repositories, a [Pulumi Stack](https://www.pulumi.com/docs/concepts/stack/) with the correct configuration needs to exists.

The stack can be deployed via:

```bash
yarn install
yarn build; pulumi up
```

## Destroying the Infrastructure

The entire infrastructure can be destroyed via:

```bash
yarn install
yarn build; pulumi destroy
```

**Attention**: you must set `ALLOW_REPOSITORY_DELETION="true"` as an environment variable to be able to delete repositories!

## Environment Variables

To successfully run, and configure the Pulumi plugins, you need to set a list of environment variables. Alternatively, refer to the used Pulumi provider's configuration documentation.

- `AWS_REGION`: the AWS region to use
- `AWS_ACCESS_KEY_ID`: the AWS secret key
- `AWS_SECRET_ACCESS_KEY`: the AWS secret access key
- `GITHUB_TOKEN`: the GitHub token with permissions to manage repositories
- `PULUMI_ACCESS_TOKEN`: the Pulumi access token
- `VAULT_ADDR`: the Vault address
- `VAULT_TOKEN`: the Vault token

---

## Configuration

The following section describes the configuration which must be set in the Pulumi Stack.

***Attention:*** do use [Secrets Encryption](https://www.pulumi.com/docs/concepts/secrets/#:~:text=Pulumi%20never%20sends%20authentication%20secrets,“secrets”%20for%20extra%20protection.) provided by Pulumi for secret values!

### YAML Configuration

Repositories are defined in YAML format in the file [`assets/repositories.yml`](assets/repositories.yml).

```yaml
---
repositories:
  - name: name
    teams: # provides access to the repository
      - team-a
      - team-b
    aws: true # creates and stores an AWS access key
    pulumi: true # creates and stores a Pulumi access token
    requiredChecks: [] # sets required checks for the repository
```

---

## Continuous Integration and Automations

- [GitHub Actions](https://docs.github.com/en/actions) are linting, and verifying the code.
- [Renovate Bot](https://github.com/renovatebot/renovate) is updating NodeJS packages, and GitHub Actions.
