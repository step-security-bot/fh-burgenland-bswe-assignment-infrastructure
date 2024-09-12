import * as github from '@pulumi/github';

import { RepositoryConfig } from '../../model/config/repository';
import { repositories } from '../configuration';

const DEFAULT_BRANCH_RULESET_PATTERNS = ['~DEFAULT_BRANCH'];

/**
 * Creates GitHub repository rulesets.
 *
 * @param {StringMap<github.GetRepositoryResult>} githubRepositories the GitHub repositories
 */
export const createRepositoryRulesets = () =>
  repositories.repositories.forEach((repository) =>
    createRepositoryRuleset(repository),
  );

/**
 * Creates a GitHub repository ruleset.
 *
 * @param {RepositoryConfig} repository the repository configuration
 */
const createRepositoryRuleset = (repository: RepositoryConfig) => {
  new github.RepositoryRuleset(
    `github-repository-ruleset-${repository.name}`,
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
          repository.requiredChecks.length > 0
            ? {
                requiredChecks: repository.requiredChecks.map((check) => ({
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
    {},
  );
};
