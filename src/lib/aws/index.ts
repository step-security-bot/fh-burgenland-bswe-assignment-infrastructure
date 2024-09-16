import * as aws from '@pulumi/aws';
import * as vault from '@pulumi/vault';

import { repositories } from '../configuration';

import { createAccountIam } from './iam';

/**
 * Creates all AWS related infrastructure.
 *
 * @param {vault.Mount} store the vault store
 * @returns {Promise<string[]>} the repositories which requested an access token
 */
export const configureAwsAccounts = async (
  store: vault.Mount,
): Promise<string[]> => {
  const identityProvider = await aws.iam.getOpenIdConnectProvider({
    url: 'https://token.actions.githubusercontent.com',
  });

  const repos = repositories
    .filter((repo) => repo.aws)
    .map((repo) => repo.name);

  repos.forEach((repository) =>
    createAccountIam(repository, identityProvider.arn, store),
  );

  return repos;
};
