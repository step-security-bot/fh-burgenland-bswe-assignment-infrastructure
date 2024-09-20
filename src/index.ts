/* eslint-disable functional/no-let */

import { Output } from '@pulumi/pulumi';

import { configureAwsAccounts } from './lib/aws';
import { repositories } from './lib/configuration';
import { createRepositories } from './lib/github';
import { createTeams } from './lib/github/team';
import { configureTerraform } from './lib/pulumi';
import { createStore } from './lib/vault';
import { StringMap } from './model/map';

export = async () => {
  const githubTeams = createTeams();
  const githubRepositories = createRepositories(githubTeams);

  let vaultStore = undefined;
  let terraform: StringMap<Output<string>> = {};
  let aws: StringMap<Output<string>> = {};

  const needsVault = repositories.some((repo) => repo.aws || repo.terraform);
  if (needsVault) {
    vaultStore = createStore();
    terraform = configureTerraform(vaultStore);
    aws = await configureAwsAccounts(githubRepositories, vaultStore);
  }

  return {
    vault: vaultStore ? vaultStore.path : '',
    aws: aws,
    terraform: terraform,
    teams: Object.values(githubTeams).map((team) => team.name),
    repositories: Object.values(githubRepositories).map((repo) => repo.name),
  };
};
