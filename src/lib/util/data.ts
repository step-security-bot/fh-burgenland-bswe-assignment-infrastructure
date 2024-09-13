import { readFileSync } from 'fs';

import { parse } from 'yaml';

import { DataConfig } from '../../model/config/data';

/**
 * Parse a YAML file from a given path and converts it into a data configuration.
 *
 * @param {string} path the path
 * @returns {DataConfig} the data configuration
 */
export const parseDataFromFile = (path: string): DataConfig =>
  parse(readFileSync(path, 'utf8')) as DataConfig;
