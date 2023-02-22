/// <reference types="long" />
import { OfflineDirectSigner, AccountData, DirectSignResponse } from '@cosmjs/proto-signing';
import { WalletAccount } from '@cosmos-kit/core';
import { TerraExtension } from './extension';
export interface SignDoc {
    bodyBytes: Uint8Array;
    authInfoBytes: Uint8Array;
    chainId: string;
    accountNumber: Long;
}
export declare class OfflineSigner implements OfflineDirectSigner {
    private client;
    accountInfo: WalletAccount;
    constructor(client: TerraExtension, accountInfo: WalletAccount);
    getAccounts(): Promise<readonly AccountData[]>;
    signDirect(_signerAddress: string, _signDoc: SignDoc): Promise<DirectSignResponse>;
}
