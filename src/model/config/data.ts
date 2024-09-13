import { RepositoryConfig } from './repository';
import { TeamConfig } from './team';

/**
 * Defines the input data config.
 */
export interface DataConfig {
  readonly repositories: readonly RepositoryConfig[];
  readonly teams: readonly TeamConfig[];
}
