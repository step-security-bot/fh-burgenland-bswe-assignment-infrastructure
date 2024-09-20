import { Output } from '@pulumi/pulumi';
import * as pulumiservice from '@pulumi/pulumiservice';
import * as vault from '@pulumi/vault';

import { StringMap } from '../../model/map';
import { environment, repositories } from '../configuration';
import { writeToVault } from '../util/vault/secret';

/**
 * Creates all Pulumi related infrastructure.
 *
 * @param {vault.Mount} store the vault store
 * @returns {StringMap<Output<string>>} the repositories and their Pulumi access tokens
 */
export const configurePulumi = (
  store: vault.Mount,
): StringMap<Output<string>> => {
  const repos = repositories
    .filter((repo) => repo.pulumi)
    .map((repo) => repo.name);

  const accessTokens = Object.fromEntries(
    repos.map((repository) => [
      repository,
      configureRepository(repository, store),
    ]),
  );

  return accessTokens;
};

/**
 * Configures a repository for Pulumi.
 *
 * @param {string} repository the repository
 * @param {vault.Mount} store the vault store
 * @returns {Output<string>} the Pulumi access token
 */
const configureRepository = (
  repository: string,
  store: vault.Mount,
): Output<string> => {
  const accessToken = new pulumiservice.AccessToken(
    `pulumi-access-token-${environment}-${repository}`,
    {
      description: `FH Burgenland: BSWE assignment ${environment} repository: ${repository}`,
    },
    {},
  );

  writeToVault(
    `terraform-${repository}`,
    accessToken.value.apply((token) =>
      JSON.stringify({
        access_token: token ?? '',
      }),
    ),
    store,
  );

  return accessToken.value;
};
