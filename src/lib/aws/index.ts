import * as aws from '@pulumi/aws';
import { all, Output } from '@pulumi/pulumi';
import * as vault from '@pulumi/vault';

import {
  awsDefaultRegion,
  commonLabels,
  environment,
  repositories,
} from '../configuration';
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
  const repos = repositories
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
    `aws-policy-fh-burgenland-bswe-${environment}-${repository}`,
    {
      policy: aws.iam
        .getPolicyDocument({
          statements: [
            {
              effect: 'Allow',
              actions: [
                's3:AbortMultipartUpload',
                's3:CreateBucket',
                's3:DeleteBucket',
                's3:DeleteBucketPolicy',
                's3:DeleteBucketWebsite',
                's3:DeleteObject',
                's3:DeleteObjectTagging',
                's3:DeleteObjectVersion',
                's3:DeleteObjectVersionTagging',
                's3:GetAccountPublicAccessBlock',
                's3:GetBucketAcl',
                's3:GetBucketCORS',
                's3:GetBucketLocation',
                's3:GetBucketObjectLockConfiguration',
                's3:GetBucketPolicy',
                's3:GetBucketPolicyStatus',
                's3:GetBucketPublicAccessBlock',
                's3:GetBucketTagging',
                's3:GetBucketVersioning',
                's3:GetBucketWebsite',
                's3:GetEncryptionConfiguration',
                's3:GetLifecycleConfiguration',
                's3:GetObject',
                's3:GetObjectAcl',
                's3:GetObjectAttributes',
                's3:GetObjectRetention',
                's3:GetObjectTagging',
                's3:GetObjectVersion',
                's3:GetObjectVersionAcl',
                's3:GetObjectVersionAttributes',
                's3:GetObjectVersionTagging',
                's3:ListAllMyBuckets',
                's3:ListBucket',
                's3:ListBucketMultipartUploads',
                's3:ListBucketVersions',
                's3:ListTagsForResource',
                's3:ObjectOwnerOverrideToBucketOwner',
                's3:PutBucketAcl',
                's3:PutBucketCORS',
                's3:PutBucketObjectLockConfiguration',
                's3:PutBucketPolicy',
                's3:PutBucketPublicAccessBlock',
                's3:PutBucketTagging',
                's3:PutBucketVersioning',
                's3:PutBucketWebsite',
                's3:PutEncryptionConfiguration',
                's3:PutObject',
                's3:PutObjectAcl',
                's3:PutObjectRetention',
                's3:PutObjectTagging',
                's3:PutObjectVersionAcl',
                's3:PutObjectVersionTagging',
                's3:TagResource',
                's3:UntagResource',
              ],
              resources: ['*'],
            },
            {
              effect: 'Allow',
              actions: [
                'cloudfront:CreateDistribution',
                'cloudfront:CreateInvalidation',
                'cloudfront:CreateOriginAccessControl',
                'cloudfront:CreateOriginRequestPolicy',
                'cloudfront:DeleteDistribution',
                'cloudfront:DeleteOriginAccessControl',
                'cloudfront:DeleteOriginRequestPolicy',
                'cloudfront:GetCloudFrontOriginAccessIdentity',
                'cloudfront:GetCloudFrontOriginAccessIdentityConfig',
                'cloudfront:GetDistribution',
                'cloudfront:GetDistributionConfig',
                'cloudfront:GetInvalidation',
                'cloudfront:GetOriginAccessControl',
                'cloudfront:GetOriginAccessControlConfig',
                'cloudfront:GetOriginRequestPolicy',
                'cloudfront:GetOriginRequestPolicyConfig',
                'cloudfront:GetResponseHeadersPolicy',
                'cloudfront:GetResponseHeadersPolicyConfig',
                'cloudfront:ListCloudFrontOriginAccessIdentities',
                'cloudfront:ListDistributions',
                'cloudfront:ListDistributionsByOriginRequestPolicyId',
                'cloudfront:ListDistributionsByResponseHeadersPolicyId',
                'cloudfront:ListInvalidations',
                'cloudfront:ListOriginAccessControls',
                'cloudfront:ListOriginRequestPolicies',
                'cloudfront:ListResponseHeadersPolicies',
                'cloudfront:ListTagsForResource',
                'cloudfront:TagResource',
                'cloudfront:UntagResource',
                'cloudfront:UpdateCloudFrontOriginAccessIdentity',
                'cloudfront:UpdateDistribution',
                'cloudfront:UpdateDistributionWithStagingConfig',
                'cloudfront:UpdateOriginAccessControl',
                'cloudfront:UpdateOriginRequestPolicy',
                'cloudfront:UpdateResponseHeadersPolicy',
              ],
              resources: ['*'],
            },
          ],
        })
        .then((doc) => doc.json),
      tags: commonLabels,
    },
    {},
  );
  const iam = createAWSIamUserAndKey(`fh-bswe-${environment}-${repository}`, {
    policies: [policy],
  });

  writeToGitHubActionsSecret(repository, 'AWS_ACCESS_KEY_ID', iam.accessKey.id);
  writeToGitHubActionsSecret(
    repository,
    'AWS_SECRET_ACCESS_KEY',
    iam.accessKey.secret,
  );
  writeToGitHubActionsSecret(
    repository,
    'AWS_REGION',
    Output.create(aws.config.region ?? awsDefaultRegion),
  );

  writeToVault(
    'aws',
    all([iam.accessKey.id, iam.accessKey.secret]).apply(
      ([accessKeyId, secretAccessKey]) =>
        JSON.stringify({
          access_key_id: accessKeyId ?? '',
          secret_access_key: secretAccessKey ?? '',
          region: aws.config.region ?? awsDefaultRegion,
        }),
    ),
    store,
  );
};
