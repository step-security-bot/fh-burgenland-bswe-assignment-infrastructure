/* eslint-disable functional/no-let */

import { Output } from '@pulumi/pulumi';

import { configureAwsAccounts } from './lib/aws';
import { repositories } from './lib/configuration';
import { createRepositories } from './lib/github';
import { createTeams } from './lib/github/team';
import { createStore } from './lib/vault';

export = async () => {
  const githubTeams = createTeams();
  const githubRepositories = createRepositories(githubTeams);

  let vaultStore = undefined;
  let aws: Output<string>[] = [];

  const needsVault = repositories.some((repo) => repo.aws);
  if (needsVault) {
    vaultStore = createStore();
    aws = await configureAwsAccounts(githubRepositories, vaultStore);
  }

  return {
    vault: vaultStore ? vaultStore.path : '',
    aws: aws,
    teams: Object.values(githubTeams).map((team) => team.name),
    repositories: Object.values(githubRepositories).map((repo) => repo.name),
  };
};
