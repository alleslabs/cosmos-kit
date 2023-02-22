import {
  OfflineDirectSigner,
  AccountData,
  Registry,
  DirectSignResponse,
} from '@cosmjs/proto-signing';
import { StdSignature } from '@cosmjs/amino';
import { WalletAccount } from '@cosmos-kit/core';
import { TerraExtension } from './extension';
import { defaultRegistryTypes as defaultStargateTypes } from '@cosmjs/stargate';
import { wasmTypes } from '@cosmjs/cosmwasm-stargate/build/modules/index';
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { camelToSnake, FakeMsg } from './utils';

export interface SignDoc {
  bodyBytes: Uint8Array;
  authInfoBytes: Uint8Array;
  chainId: string;
  accountNumber: Long;
}

export class OfflineSigner implements OfflineDirectSigner {
  private client: TerraExtension;
  accountInfo: WalletAccount;

  constructor(client: TerraExtension, accountInfo: WalletAccount) {
    this.client = client;
    this.accountInfo = accountInfo;
  }

  async getAccounts(): Promise<readonly AccountData[]> {
    return [
      {
        address: this.accountInfo.address,
        algo: this.accountInfo.algo || 'secp256k1',
        pubkey: this.accountInfo.pubkey,
      },
    ];
  }

  async signDirect(
    _signerAddress: string,
    _signDoc: SignDoc
  ): Promise<DirectSignResponse> {
    console.log('_signDoc', Buffer.from(_signDoc.bodyBytes).toString('base64'));

    // get typeUrl from TxBody
    const typeUrls = TxBody.decode(_signDoc.bodyBytes).messages.map(
      ({ typeUrl }) => typeUrl
    );

    const registry = new Registry([...defaultStargateTypes, ...wasmTypes]);

    const decodedTxBody = registry.decodeTxBody(_signDoc.bodyBytes);
    const messages = decodedTxBody.messages.map(
      (msg, i) =>
        new FakeMsg({
          '@type': typeUrls[i],
          // hack: convert camelCase to snake_case
          ...(camelToSnake(msg as any) as object),
        })
    );

    const chainID = _signDoc.chainId;

    const signResponse = await this.client.sign({
      chainID,
      msgs: messages as any,
      // fee: new Fee(1000000, '200000uluna'),
      // memo: decodedTxBody.memo,
      // gasAdjustment: 1.5,
    });

    console.log('signResponse', signResponse);
    const signatureBase64 = signResponse.payload.result.signatures[0];
    console.log('signatureBase64', signatureBase64);

    const pubkey = (signResponse.payload.result.auth_info.signer_infos[0]
      .public_key as any).key;

    const signature: StdSignature = {
      pub_key: pubkey,
      signature: signatureBase64,
    };

    console.log(signature);

    return {
      signed: _signDoc,
      signature,
    };
  }
}
