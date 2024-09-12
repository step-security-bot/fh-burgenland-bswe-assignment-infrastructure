import { readFileSync } from 'fs';

import { parse } from 'yaml';

import { RepositoryiesConfig } from '../../model/config/repository';

/**
 * Parse a YAML file from a given path and converts it into a repository configuration.
 *
 * @param {string} path the path
 * @returns {RepositoryiesConfig} the repositories
 */
export const parseRepositoriesFromFiles = (path: string): RepositoryiesConfig =>
  parse(readFileSync(path, 'utf8')) as RepositoryiesConfig;
