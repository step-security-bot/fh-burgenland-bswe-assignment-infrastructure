/**
 * Defines repository config.
 */
export interface RepositoryConfig {
  readonly name: string;
  readonly service: string;
  readonly teams: readonly string[];
  readonly deleteOnDestroy?: boolean;
  readonly aws: boolean;
  readonly terraform: boolean;
  readonly pulumi: boolean;
  readonly requiredChecks: readonly string[];
}
