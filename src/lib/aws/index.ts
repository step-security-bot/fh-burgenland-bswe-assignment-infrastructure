import * as aws from '@pulumi/aws';
import { all } from '@pulumi/pulumi';
import * as vault from '@pulumi/vault';

import { commonLabels, repositories } from '../configuration';
import { createAWSIamUserAndKey } from '../util/aws/iam_user';
import { writeToGitHubActionsSecret } from '../util/github/secret';
import { writeToVault } from '../util/vault/secret';

/**
 * Creates all AWS related infrastructure.
 *
 * @param {vault.Mount} store the vault store
 * @returns {string[]} the repositories which requested an access token
 */
export const configureAwsAccounts = (store: vault.Mount): string[] => {
  const repos = repositories.repositories
    .filter((repo) => repo.aws)
    .map((repo) => repo.name);

  repos.forEach((repository) => configureRepository(repository, store));

  return repos;
};

/**
 * Configures a repository for AWS.
 *
 * @param {string} repository the repository
 * @param {vault.Mount} store the vault store
 */
const configureRepository = (repository: string, store: vault.Mount) => {
  const policy = new aws.iam.Policy(
    `aws-policy-fh-burgenland-bswe-${repository}`,
    {
      policy: aws.iam
        .getPolicyDocument({
          statements: [
            {
              effect: 'Allow',
              actions: ['s3:PutRecord', 'firehose:PutRecordBatch'],
              resources: ['*'],
            },
            {
              effect: 'Allow',
              actions: ['firehose:DescribeDeliveryStream'],
              resources: ['*'],
            },
          ],
        })
        .then((doc) => doc.json),
      tags: commonLabels,
    },
    {},
  );
  const iam = createAWSIamUserAndKey(`fh-bswe-${repository}`, {
    policies: [policy],
  });

  writeToGitHubActionsSecret(repository, 'AWS_ACCESS_KEY_ID', iam.accessKey.id);
  writeToGitHubActionsSecret(
    repository,
    'AWS_SECRET_ACCESS_KEY',
    iam.accessKey.secret,
  );

  writeToVault(
    'aws',
    all([iam.accessKey.id, iam.accessKey.secret]).apply(
      ([accessKeyId, secretAccessKey]) =>
        JSON.stringify({
          access_key_id: accessKeyId ?? '',
          secret_access_key: secretAccessKey ?? '',
        }),
    ),
    store,
  );
};
