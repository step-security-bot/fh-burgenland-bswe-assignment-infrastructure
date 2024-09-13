import { Output } from '@pulumi/pulumi';
import * as vault from '@pulumi/vault';

import { environment } from '../../configuration';

/**
 * Stores a value in Vault.
 *
 * @param {string} key the key
 * @param {Output<string>} value the value
 * @param {vault.Mount} vaultStore the optional vault store
 */
export const writeToVault = (
  key: string,
  value: Output<string>,
  vaultStore?: vault.Mount,
) => {
  vaultStore?.path?.apply(
    (storePath) =>
      new vault.kv.SecretV2(
        `vault-secret-${environment}-${storePath}-${key}`,
        {
          mount: storePath,
          name: key,
          dataJson: value,
        },
        {
          dependsOn: [vaultStore],
        },
      ),
  );
};
