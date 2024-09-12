import * as vault from '@pulumi/vault';

import { environment } from '../configuration';

/**
 * Creates a Vault store.
 *
 * @returns {vault.Mount} the Vault store
 */
export const createStore = (): vault.Mount =>
  new vault.Mount(
    `vault-store-fh-burgenland-bswe-assignment-infrastructure-${environment}`,
    {
      path: `fh-burgenland-bswe-assignment-infrastructure-${environment}`,
      type: 'kv',
      options: {
        version: '2',
      },
      description: `FH Burgenland: BSWE assignment ${environment}`,
    },
    {},
  );
