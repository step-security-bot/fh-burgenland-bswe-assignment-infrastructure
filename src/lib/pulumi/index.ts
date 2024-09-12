import * as pulumiservice from '@pulumi/pulumiservice';
import * as vault from '@pulumi/vault';

import { repositories } from '../configuration';
import { writeToGitHubActionsSecret } from '../util/github/secret';
import { writeToVault } from '../util/vault/secret';

/**
 * Creates all Pulumi related infrastructure.
 *
 * @param {vault.Mount} store the vault store
 * @returns {string[]} the repositories which requested an access token
 */
export const configurePulumi = (store: vault.Mount): string[] => {
  const repos = repositories.repositories
    .filter((repo) => repo.pulumi)
    .map((repo) => repo.name);

  repos.forEach((repository) => configureRepository(repository, store));

  return repos;
};

/**
 * Configures a repository for Pulumi.
 *
 * @param {string} repository the repository
 * @param {vault.Mount} store the vault store
 */
const configureRepository = (repository: string, store: vault.Mount) => {
  const accessToken = new pulumiservice.AccessToken(
    `pulumi-access-token-${repository}`,
    {
      description: `GitHub Repository: ${repository}`,
    },
    {},
  );

  writeToGitHubActionsSecret(
    repository,
    'PULUMI_ACCESS_TOKEN',
    accessToken.value,
  );

  writeToVault(
    'pulumi',
    accessToken.value.apply((token) =>
      JSON.stringify({
        access_token: token ?? '',
      }),
    ),
    store,
  );
};
