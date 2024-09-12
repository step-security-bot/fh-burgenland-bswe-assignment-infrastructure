import * as github from '@pulumi/github';

import { repositories } from '../configuration';

/**
 * Creates all access permissions for a repository.
 */
export const createRepositoryAccess = async () => {
  const teams = Object.fromEntries(
    (
      await github.getOrganizationTeams({
        rootTeamsOnly: true,
        resultsPerPage: 100,
        summaryOnly: true,
      })
    ).teams.map((team) => [team.slug, team.id]),
  );

  repositories.repositories.forEach(async (repository) => {
    repository.teams.forEach(async (team) => {
      createTeamAccess(repository.name, team, teams[team]);
    });
  });
};

/**
 * Creates access permissions for the team to the repository.
 *
 * @param {string} repository the repository name
 * @param {string} team the team name
 * @param {number} teamId the team id
 */
const createTeamAccess = (repository: string, team: string, teamId: number) =>
  new github.TeamRepository(
    `github-team-repository-${repository}-${team}`,
    {
      repository: repository,
      teamId: teamId.toString(),
      permission: 'maintain',
    },
    {},
  );
