import * as github from '@pulumi/github';

import { TeamConfig } from '../../model/config/team';
import { StringMap } from '../../model/map';
import { environment, globalName, teams } from '../configuration';

/**
 * Creates all GitHub teams.
 *
 * @returns {StringMap<github.Team>} the configured teams
 */
export const createTeams = (): StringMap<github.Team> =>
  Object.fromEntries(teams.map((team) => [team.name, createTeam(team)]));

/**
 * Creates a GitHub team.
 *
 * @param {TeamConfig} team the team configuration
 * @returns {github.Team} the team
 */
const createTeam = (team: TeamConfig): github.Team => {
  const githubTeam = new github.Team(
    `github-team-${team.name}`,
    {
      name: `${globalName}-${environment}-${team.name}`,
      description: `Softwaremanagement II ${environment}: ${team.name}`,
      privacy: 'secret',
    },
    {
      retainOnDelete: !team.deleteOnDestroy,
    },
  );

  team.members.forEach(
    (member) =>
      new github.TeamMembership(
        `github-team-membership-${team.name}-${member}`,
        {
          teamId: githubTeam.id,
          username: member,
          role: 'member',
        },
        {
          retainOnDelete: !team.deleteOnDestroy,
          dependsOn: [githubTeam],
        },
      ),
  );

  return githubTeam;
};
