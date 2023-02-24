import { WalletClient, WalletAccount } from '@cosmos-kit/core';
import { LCDClient } from '@terra-money/feather.js';
import { decodePubkey } from '@cosmjs/proto-signing';
import { BaseAccount as BaseAccount_pb } from '@terra-money/terra.proto/cosmos/auth/v1beta1/auth';
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

    const lcd = LCDClient.fromDefaultConfig(
      chainId === 'phoenix-1' ? 'mainnet' : 'testnet'
    );

    // HACK: doesn't use when signing process
    let pubkey = fromBase64('ApK7dnTXNvycFDkLcNbFy9fi1OMnfjHMLWP+pWoulwoh');
    let algo: 'secp256k1' | 'ed25519' | 'sr25519' = 'secp256k1';

    try {
      const accountInfo = (
        await lcd.auth.accountInfo(account.address)
      ).toProto() as BaseAccount_pb;

      if (accountInfo?.pubKey?.typeUrl.match(/secp256k1/i)) {
        algo = 'secp256k1';
      } else if (accountInfo?.pubKey?.typeUrl.match(/ed25519/i)) {
        algo = 'ed25519';
      } else if (accountInfo?.pubKey?.typeUrl.match(/sr25519/i)) {
        algo = 'sr25519';
      }

      if (accountInfo.pubKey) {
        pubkey = fromBase64(decodePubkey(accountInfo.pubKey).value);
      }
    } catch (err) {
      console.log(err);
    }

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
