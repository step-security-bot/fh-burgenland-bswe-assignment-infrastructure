import * as github from '@pulumi/github';

import { StringMap } from '../../model/map';
import { repositories } from '../configuration';

/**
 * Fetches all GitHub repositories.
 *
 * @returns {Promise<StringMap<github.GetRepositoryResult>>} the configured repositories
 */
export const fetchRepositories = async (): Promise<
  StringMap<github.GetRepositoryResult>
> =>
  Object.fromEntries(
    await Promise.all(
      repositories.repositories.map(async (repository) => [
        repository.name,
        await fetchRepository(repository.name),
      ]),
    ),
  );

/**
 * Fetches a GitHub repository.
 *
 * @param {string} name the repository name
 * @returns {Promise<github.GetRepositoryResult>} the repository
 */
const fetchRepository = (name: string): Promise<github.GetRepositoryResult> =>
  github.getRepository({
    name: name,
  });
