import * as github from '@pulumi/github';

import { RepositoryConfig } from '../../model/config/repository';
import { StringMap } from '../../model/map';
import { environment, repositories } from '../configuration';

import { createRepositoryAccess } from './access';
import { createRepositoryRulesets } from './ruleset';

/**
 * Creates all GitHub repositories.
 *
 * @param {StringMap<github.Team>} githubTeams the GitHub teams
 * @param {StringMap<string>} organizationTeams the organization teams
 * @returns {StringMap<github.Repository>} the configured repositories
 */
export const createRepositories = (
  githubTeams: StringMap<github.Team>,
  organizationTeams: StringMap<string>,
): StringMap<github.Repository> =>
  Object.fromEntries(
    repositories.map((repository) => [
      repository.name,
      createRepository(repository, githubTeams, organizationTeams),
    ]),
  );

/**
 * Creates a GitHub repository.
 *
 * @param {RepositoryConfig} repository the repository configuration
 * @param {StringMap<github.Team>} githubTeams the GitHub teams
 * @param {StringMap<string>} organizationTeams the organization teams
 * @returns {github.Repository} the repository
 */
const createRepository = (
  repository: RepositoryConfig,
  githubTeams: StringMap<github.Team>,
  organizationTeams: StringMap<string>,
): github.Repository => {
  const githubRepository = new github.Repository(
    `github-repo-${environment}-${repository.name}`,
    {
      name: repository.name,
      description: `Softwaremanagement II ${environment}: ${repository.service} repository`,
      hasDiscussions: false,
      hasWiki: true,
      topics: ['swm2', environment, repository.service].sort(),
      visibility: 'private',
      allowAutoMerge: false,
      allowMergeCommit: false,
      allowRebaseMerge: true,
      allowSquashMerge: false,
      allowUpdateBranch: true,
      archived: false,
      archiveOnDestroy: !repository.deleteOnDestroy,
      autoInit: false,
      deleteBranchOnMerge: true,
      hasDownloads: true,
      hasIssues: true,
      hasProjects: true,
      mergeCommitMessage: 'PR_TITLE',
      mergeCommitTitle: 'MERGE_MESSAGE',
      squashMergeCommitMessage: 'COMMIT_MESSAGES',
      squashMergeCommitTitle: 'COMMIT_OR_PR_TITLE',
      vulnerabilityAlerts: true,
    },
    {
      retainOnDelete: !repository.deleteOnDestroy,
      ignoreChanges: ['securityAndAnalysis', 'template'],
    },
  );

  createRepositoryRulesets(repository, githubRepository);
  createRepositoryAccess(
    repository,
    githubRepository,
    githubTeams,
    organizationTeams,
  );

  return githubRepository;
};
