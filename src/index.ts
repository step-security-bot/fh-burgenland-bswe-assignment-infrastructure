/* eslint-disable functional/no-let */

import { Output } from '@pulumi/pulumi';

import { configureAwsAccounts } from './lib/aws';
import { repositories } from './lib/configuration';
import { createRepositories } from './lib/github';
import { createTeams } from './lib/github/team';
import { configurePulumi } from './lib/pulumi';
import { createStore } from './lib/vault';
import { StringMap } from './model/map';

export = async () => {
  const githubTeams = createTeams();
  const githubRepositories = createRepositories(githubTeams);

  let vaultStore = undefined;
  let pulumis: StringMap<Output<string>> = {};
  let aws: Output<string>[] = [];

  const needsVault = repositories.some((repo) => repo.aws || repo.pulumi);
  if (needsVault) {
    vaultStore = createStore();
    pulumis = configurePulumi(vaultStore);
    aws = await configureAwsAccounts(githubRepositories, vaultStore);
  }

  return {
    vault: vaultStore ? vaultStore.path : '',
    aws: aws,
    pulumi: pulumis,
    teams: Object.values(githubTeams).map((team) => team.name),
    repositories: Object.values(githubRepositories).map((repo) => repo.name),
  };
};
