/**
 * Defines team config.
 */
export interface TeamConfig {
  readonly name: string;
  readonly deleteOnDestroy?: boolean;
  readonly members: readonly string[];
}
