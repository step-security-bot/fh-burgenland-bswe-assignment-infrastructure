/**
 * Defines repositories config.
 */
export interface RepositoryiesConfig {
  readonly repositories: readonly RepositoryConfig[];
}

/**
 * Defines repositoriy config.
 */
export interface RepositoryConfig {
  readonly name: string;
  readonly teams: readonly string[];
  readonly aws: boolean;
  readonly pulumi: boolean;
  readonly requiredChecks: readonly string[];
}
