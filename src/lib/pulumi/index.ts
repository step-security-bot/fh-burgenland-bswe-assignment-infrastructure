import * as aws from '@pulumi/aws';
import { Output } from '@pulumi/pulumi';
import * as vault from '@pulumi/vault';

import { StringMap } from '../../model/map';
import {
  commonLabels,
  environment,
  globalName,
  repositories,
} from '../configuration';
import { writeToVault } from '../util/vault/secret';

/**
 * Creates all Terraform related infrastructure.
 *
 * @param {vault.Mount} store the vault store
 * @returns {StringMap<Output<string>>} the repositories and their Terraform backend buckets
 */
export const configureTerraform = (
  store: vault.Mount,
): StringMap<Output<string>> => {
  const buckets = Object.fromEntries(
    repositories
      .filter((repo) => repo.terraform)
      .map((repo) => [repo.name, configureRepository(repo.name, store)]),
  );

  return buckets;
};

/**
 * Configures a repository for Terraform.
 *
 * @param {string} repository the repository
 * @param {vault.Mount} store the vault store
 * @returns {Output<string>} the Terraform backend bucket
 */
const configureRepository = (
  repository: string,
  store: vault.Mount,
): Output<string> => {
  const bucket = new aws.s3.Bucket(
    `aws-s3-bucket-terraform-${environment}-${repository}`,
    {
      bucketPrefix: `bswe-${globalName}-${environment}-${repository}`,
      tags: commonLabels,
    },
    {},
  );

  writeToVault(
    `pulumi-${repository}`,
    bucket.bucket.apply((bucketName) =>
      JSON.stringify({
        bucket: bucketName,
      }),
    ),
    store,
  );

  return bucket.bucket;
};
