/* eslint-disable functional/no-let */

import * as github from '@pulumi/github';

import { configureAwsAccounts } from './lib/aws';
import { repositories } from './lib/configuration';
import { createRepositories } from './lib/github';
import { createTeams } from './lib/github/team';
import { createStore } from './lib/vault';

export = async () => {
  const organizationTeams = Object.fromEntries(
    (
      await github.getOrganizationTeams({
        rootTeamsOnly: true,
        resultsPerPage: 100,
        summaryOnly: true,
      })
    ).teams.map((team) => [team.slug, team.id.toString()]),
  );
  const githubTeams = createTeams();
  const githubRepositories = createRepositories(githubTeams, organizationTeams);

  let vaultStore = undefined;
  let aws: string[] = [];

  const needsVault = repositories.some((repo) => repo.aws);
  if (needsVault) {
    vaultStore = createStore();
    aws = configureAwsAccounts(vaultStore);
  }

  return {
    vault: vaultStore ? vaultStore.path : '',
    aws: aws,
    teams: Object.keys(githubTeams),
    repositories: Object.keys(githubRepositories),
  };
};
