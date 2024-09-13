import * as github from '@pulumi/github';
import { Output } from '@pulumi/pulumi';

import { RepositoryConfig } from '../../model/config/repository';
import { StringMap } from '../../model/map';

/**
 * Creates all access permissions for a repository.
 *
 * @param {RepositoryConfig} repository the repository configuration
 * @param {github.Repository} githubRepository the GitHub repository
 * @param {StringMap<github.Team>} githubTeams the GitHub teams
 * @param {StringMap<string>} organizationTeams the organization teams
 */
export const createRepositoryAccess = (
  repository: RepositoryConfig,
  githubRepository: github.Repository,
  githubTeams: StringMap<github.Team>,
  organizationTeams: StringMap<string>,
) => {
  repository.teams.forEach(async (team) => {
    createTeamAccess(
      githubRepository,
      team,
      githubTeams[team]?.id ||
        Output.create(organizationTeams[team].toString()),
    );
  });
};

/**
 * Creates access permissions for the team to the repository.
 *
 * @param {github.Repository} repository the repository
 * @param {string} team the team name
 * @param {number} teamId the team id
 */
const createTeamAccess = (
  repository: github.Repository,
  team: string,
  teamId: Output<string>,
) =>
  repository.name.apply(
    (repositoryName) =>
      new github.TeamRepository(
        `github-team-repository-${repositoryName}-${team}`,
        {
          repository: repositoryName,
          teamId: teamId,
          permission: 'maintain',
        },
        {
          dependsOn: [repository],
          retainOnDelete: true,
        },
      ),
  );
