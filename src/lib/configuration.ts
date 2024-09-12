import * as github from '@pulumi/github';
import { getStack } from '@pulumi/pulumi';

import { parseRepositoriesFromFiles } from './util/repository';

export const environment = getStack();

export const githubOrganisation = github.config.owner;
export const repositories = parseRepositoriesFromFiles(
  './assets/repositories.yaml',
);

export const commonLabels = {
  environment: environment,
};
