import { WalletClient, WalletAccount } from '@cosmos-kit/core';
import { TerraExtension } from './extension';
import { OfflineSigner } from './signer';
import { fromBase64 } from '@cosmjs/encoding';

export class TerraClient implements WalletClient {
  readonly client: TerraExtension;

  constructor(client: TerraExtension) {
    this.client = client;
  }

  async disconnect() {
    return;
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    if (!this.client) {
      throw new Error('Terra Station is not available');
    }

    // TODO: improve later
    if (chainId !== 'pisco-1' && chainId !== 'phoenix-1') {
      throw new Error(`Network with chainId "${chainId}" not found`);
    }

    const account = await this.client.connect();
    const info = (await this.client.info())[chainId];

    if (!info || info.chainID !== chainId) {
      throw new Error(
        `Wallet not connected to the network with chainId "${chainId}"`
      );
    }

    // For now, Station Wallet only supports cointype 330
    let pubkey = fromBase64(account.pubkey[330]);
    let algo: 'secp256k1' | 'ed25519' | 'sr25519' = 'secp256k1';

    return {
      name: 'Station Wallet',
      address: account.address,
      algo,
      pubkey,
    };
  }

  async getOfflineSigner(chainId: string) {
    const accountInfo = await this.getAccount(chainId);

    return new OfflineSigner(this.client, accountInfo);
  }
}
