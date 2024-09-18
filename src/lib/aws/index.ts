import * as aws from '@pulumi/aws';
import * as github from '@pulumi/github';
import { Output } from '@pulumi/pulumi';
import * as vault from '@pulumi/vault';

import { StringMap } from '../../model/map';
import { repositories } from '../configuration';

import { createAccountIam } from './iam';

/**
 * Creates all AWS related infrastructure.
 *
 * @param {StringMap<github.Repository>} githubRepositories the GitHub repositories
 * @param {vault.Mount} store the vault store
 * @returns {Promise<Output<string>[]>} the repositories which requested an access token
 */
export const configureAwsAccounts = async (
  githubRepositories: StringMap<github.Repository>,
  store: vault.Mount,
): Promise<Output<string>[]> => {
  const identityProvider = await aws.iam.getOpenIdConnectProvider({
    url: 'https://token.actions.githubusercontent.com',
  });

  const repos = repositories
    .filter((repo) => repo.aws)
    .map((repo) => githubRepositories[repo.name].name);

  repos.forEach((repository) =>
    createAccountIam(repository, identityProvider.arn, store),
  );

  return repos;
};
