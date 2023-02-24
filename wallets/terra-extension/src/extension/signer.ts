import {
  OfflineDirectSigner,
  AccountData,
  Registry,
  DirectSignResponse,
  encodePubkey,
} from '@cosmjs/proto-signing';
import { StdSignature } from '@cosmjs/amino';
import { WalletAccount } from '@cosmos-kit/core';
import { TerraExtension } from './extension';
import { defaultRegistryTypes as defaultStargateTypes } from '@cosmjs/stargate';
import { wasmTypes } from '@cosmjs/cosmwasm-stargate/build/modules/index';
import {
  TxBody,
  AuthInfo,
  SignerInfo,
} from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { camelToSnake, FakeMsg } from './utils';
import { Fee } from '@terra-money/feather.js';

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

    const authInfo = AuthInfo.decode(_signDoc.authInfoBytes);
    const feeAmount =
      authInfo.fee.amount[0].amount + authInfo.fee.amount[0].denom;
    const fee = new Fee(
      authInfo.fee.gasLimit.toNumber(),
      feeAmount,
      authInfo.fee.payer,
      authInfo.fee.granter
    );

    const chainID = _signDoc.chainId;

    const signResponse = await this.client.sign({
      chainID,
      msgs: messages as any,
      fee,
      memo: decodedTxBody.memo,
    });

    const signatureBase64 = signResponse.payload.result.signatures[0];

    const terraSignerInfo =
      signResponse.payload.result.auth_info.signer_infos[0];

    const newPubkey = {
      type: 'tendermint/PubKeySecp256k1',
      value: terraSignerInfo.public_key['key'],
    };

    const encodedNewPubkey = encodePubkey(newPubkey);

    const oldSignerInfo = authInfo.signerInfos[0];

    // replace pubkey
    const newSignerInfo = SignerInfo.fromPartial({
      publicKey: encodedNewPubkey,
      modeInfo: oldSignerInfo.modeInfo,
      sequence: oldSignerInfo.sequence,
    });

    const newAuthInfo = AuthInfo.fromPartial({
      signerInfos: [newSignerInfo],
      fee: authInfo.fee,
    });

    const newSignDoc = {
      bodyBytes: _signDoc.bodyBytes,
      authInfoBytes: AuthInfo.encode(newAuthInfo).finish(),
      chainId: _signDoc.chainId,
      accountNumber: _signDoc.accountNumber,
    };

    const signature: StdSignature = {
      pub_key: (signResponse.payload.result.auth_info.signer_infos[0]
        .public_key as any).key,
      signature: signatureBase64,
    };

    return {
      signed: newSignDoc,
      signature,
    };
  }
}
