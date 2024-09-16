import * as aws from '@pulumi/aws';
import { interpolate, Output } from '@pulumi/pulumi';
import * as vault from '@pulumi/vault';

import {
  awsDefaultRegion,
  commonLabels,
  githubOrganisation,
} from '../configuration';
import { writeToGitHubActionsSecret } from '../util/github/secret';
import { createRandomString } from '../util/random';
import { writeToVault } from '../util/vault/secret';

/**
 * Creates IAM for an AWS account.
 *
 * @param {string} repository the repository
 * @param {Output<string>} identityProviderArn the identity provider ARN
 * @param {vault.Mount} store the vault store
 */
export const createAccountIam = (
  repository: string,
  identityProviderArn: string,
  store: vault.Mount,
) => {
  const labels = {
    ...commonLabels,
    purpose: 'github-repository',
    organization: 'fh-burgenland-bswe',
    repository: repository,
  };

  const ciPostfix = createRandomString(`aws-iam-role-ci-${repository}`, {});
  const truncatedRepository = repository.substring(0, 18);

  const ciRole = new aws.iam.Role(
    `aws-iam-role-ci-${repository}`,
    {
      name: interpolate`ci-${truncatedRepository}-${ciPostfix.result}`,
      description: `FH Burgenland BSWE GitHub Repository: ${repository}`,
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRoleWithWebIdentity',
            Effect: 'Allow',
            Principal: {
              Federated: identityProviderArn,
            },
            Condition: {
              StringEquals: {
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
              },
              StringLike: {
                'token.actions.githubusercontent.com:sub': `repo:${githubOrganisation}/${repository}:*`,
              },
            },
          },
        ],
      }),
      tags: labels,
    },
    {},
  );

  const policy = new aws.iam.Policy(
    `aws-iam-role-ci-policy-${repository}`,
    {
      name: interpolate`ci-${truncatedRepository}-${ciPostfix.result}`,
      description: `FH Burgenland BSWE GitHub Repository: ${repository}`,
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
      tags: labels,
    },
    {},
  );

  new aws.iam.RolePolicyAttachment(
    `aws-iam-role-ci-policy-attachment-${repository}`,
    {
      role: ciRole.name,
      policyArn: policy.arn,
    },
    {
      dependsOn: [ciRole, policy],
    },
  );

  writeToGitHubActionsSecret(repository, 'AWS_IDENTITY_ROLE_ARN', ciRole.arn);
  writeToGitHubActionsSecret(
    repository,
    'AWS_REGION',
    Output.create(awsDefaultRegion),
  );

  writeToVault(
    'aws',
    ciRole.arn.apply((ciRoleArn) =>
      JSON.stringify({
        identity_role_arn: ciRoleArn,
        region: awsDefaultRegion,
      }),
    ),
    store,
  );
};
