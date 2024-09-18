import * as vault from '@pulumi/vault';

import { environment, globalName } from '../configuration';

/**
 * Creates a Vault store.
 *
 * @returns {vault.Mount} the Vault store
 */
export const createStore = (): vault.Mount =>
  new vault.Mount(
    `vault-store-fh-burgenland-bswe-assignment-infrastructure`,
    {
      path: `fh-burgenland-bswe-assignment-infrastructure-${globalName}-${environment}`,
      type: 'kv',
      options: {
        version: '2',
      },
      description: `FH Burgenland: Softwaremanagement II assignment ${environment}`,
    },
    {},
  );
