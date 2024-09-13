import * as github from '@pulumi/github';

import { RepositoryConfig } from '../../model/config/repository';

const DEFAULT_BRANCH_RULESET_PATTERNS = ['~DEFAULT_BRANCH'];

/**
 * Creates GitHub repository rulesets.
 *
 * @param {github.Repository} repository the repository
 */
export const createRepositoryRulesets = (
  config: RepositoryConfig,
  repository: github.Repository,
) => {
  new github.RepositoryRuleset(
    `github-repository-ruleset-${config.name}`,
    {
      repository: repository.name,
      target: 'branch',
      enforcement: 'active',
      rules: {
        creation: true,
        deletion: true,
        nonFastForward: false,
        pullRequest: {
          dismissStaleReviewsOnPush: true,
          requireCodeOwnerReview: false,
          requiredApprovingReviewCount: 1,
          requiredReviewThreadResolution: true,
          requireLastPushApproval: true,
        },
        requiredDeployments: {
          requiredDeploymentEnvironments: [],
        },
        requiredLinearHistory: true,
        requiredSignatures: false,
        requiredStatusChecks:
          config.requiredChecks.length > 0
            ? {
                requiredChecks: config.requiredChecks.map((check) => ({
                  context: check,
                })),
                strictRequiredStatusChecksPolicy: true,
              }
            : undefined,
        update: true,
        updateAllowsFetchAndMerge: false,
      },
      bypassActors: [
        {
          actorId: 2, // maintainer
          actorType: 'RepositoryRole',
          bypassMode: 'pull_request',
        },
        {
          actorId: 5, // admin
          actorType: 'RepositoryRole',
          bypassMode: 'always',
        },
      ],
      conditions: {
        refName: {
          excludes: [],
          includes: DEFAULT_BRANCH_RULESET_PATTERNS,
        },
      },
    },
    {
      dependsOn: [repository],
    },
  );
};
