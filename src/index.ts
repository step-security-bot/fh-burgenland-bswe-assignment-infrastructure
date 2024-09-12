/* eslint-disable functional/no-let */

import { configureAwsAccounts } from './lib/aws';
import { repositories } from './lib/configuration';
import { fetchRepositories } from './lib/github';
import { createRepositoryAccess } from './lib/github/access';
import { createRepositoryRulesets } from './lib/github/ruleset';
import { configurePulumi } from './lib/pulumi';
import { createStore } from './lib/vault';

export = async () => {
  const githubRepositories = await fetchRepositories();
  createRepositoryRulesets();
  createRepositoryAccess();

  let vaultStore = undefined;
  let pulumis: string[] = [];
  let aws: string[] = [];

  const needsVault = repositories.repositories.some(
    (repo) => repo.aws || repo.pulumi,
  );
  if (needsVault) {
    vaultStore = createStore();
    pulumis = configurePulumi(vaultStore);
    aws = configureAwsAccounts(vaultStore);
  }

  return {
    vault: vaultStore ? vaultStore.path : '',
    aws: aws,
    pulumi: pulumis,
    repositories: Object.keys(githubRepositories),
  };
};
