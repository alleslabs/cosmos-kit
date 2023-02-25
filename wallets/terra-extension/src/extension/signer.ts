import {
  AccountData,
  DirectSignResponse,
  encodePubkey,
} from '@cosmjs/proto-signing';
import {
  OfflineAminoSigner,
  AminoSignResponse,
  StdSignDoc,
  StdSignature,
} from '@cosmjs/amino';
import { WalletAccount } from '@cosmos-kit/core';
import { TerraExtension } from './extension';
import {
  TxBody,
  AuthInfo,
  SignerInfo,
} from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import {
  Fee as TerraFee,
  Msg as TerraMsg,
  SignMode,
} from '@terra-money/feather.js';

export interface SignDoc {
  bodyBytes: Uint8Array;
  authInfoBytes: Uint8Array;
  chainId: string;
  accountNumber: Long;
}

export class OfflineSigner implements OfflineAminoSigner {
  private extension: TerraExtension;
  accountInfo: WalletAccount;

  constructor(extension: TerraExtension, accountInfo: WalletAccount) {
    this.extension = extension;
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

  async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    console.log('signAmino', signerAddress, signDoc);
    const signDocFee = signDoc.fee;
    const feeAmount = signDocFee.amount[0].amount + signDocFee.amount[0].denom;

    const fakeMsgs = signDoc.msgs.map((msg) =>
      TerraMsg.fromAmino(msg as TerraMsg.Amino)
    );

    const signResponse = await this.extension.sign({
      chainID: signDoc.chain_id,
      msgs: fakeMsgs as any,
      // remark
      // Not sure how to request signMode to station wallet
      // station keep using SIGN_MODE_DIRECT
      signMode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
      fee: new TerraFee(
        parseInt(signDocFee.gas),
        feeAmount,
        signDocFee.payer,
        signDocFee.granter
      ),
      memo: signDoc.memo,
    } as any);

    console.log('signResponse xx', signResponse);

    const signature: StdSignature = {
      pub_key: (signResponse.payload.result.auth_info.signer_infos[0]
        .public_key as any).key,
      signature: signResponse.payload.result.signatures[0],
    };

    console.log('signature', signature);

    return {
      signed: signDoc,
      signature,
    };
  }

  // To force `cosmos-kit` use `signAmino` instead of `signDirect`
  async signDirectKKK(
    _signerAddress: string,
    _signDoc: SignDoc
  ): Promise<DirectSignResponse> {
    const txbody = TxBody.decode(_signDoc.bodyBytes);

    const authInfo = AuthInfo.decode(_signDoc.authInfoBytes);

    const feeAmount =
      authInfo.fee.amount[0].amount + authInfo.fee.amount[0].denom;
    const fee = new TerraFee(
      authInfo.fee.gasLimit.toNumber(),
      feeAmount,
      authInfo.fee.payer,
      authInfo.fee.granter
    );

    const chainID = _signDoc.chainId;

    const signResponse = await this.extension.sign({
      chainID,
      msgs: txbody.messages.map((msg) => TerraMsg.fromProto(msg)),
      fee,
      memo: txbody.memo,
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
      ...oldSignerInfo,
      publicKey: encodedNewPubkey,
    });

    const newAuthInfo = AuthInfo.fromPartial({
      signerInfos: [newSignerInfo],
      fee: authInfo.fee,
    });

    const newSignDoc = {
      ..._signDoc,
      authInfoBytes: AuthInfo.encode(newAuthInfo).finish(),
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
