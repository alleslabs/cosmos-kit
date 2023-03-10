/// <reference types="node" />
/// <reference types="node" />
import { AminoSignResponse, OfflineAminoSigner, StdSignDoc } from '@cosmjs/amino';
import { DirectSignResponse, OfflineDirectSigner } from '@cosmjs/proto-signing';
import { DirectSignDoc, Logger, AppUrl, Mutable, SignOptions, SimpleAccount, State, Wallet, WalletAccount, WalletClient, WalletClientActions, WalletConnectOptions, DappEnv } from '@cosmos-kit/core';
import SignClient from '@walletconnect/sign-client';
import { PairingTypes, SessionTypes } from '@walletconnect/types';
import EventEmitter from 'events';
export declare class WCClient implements WalletClient {
    readonly walletInfo: Wallet;
    signClient?: SignClient;
    wcCloudInfo?: any;
    actions?: WalletClientActions;
    qrUrl: Mutable<string>;
    appUrl: Mutable<AppUrl>;
    pairings: PairingTypes.Struct[];
    sessions: SessionTypes.Struct[];
    emitter?: EventEmitter;
    logger?: Logger;
    options?: WalletConnectOptions;
    relayUrl?: string;
    env?: DappEnv;
    constructor(walletInfo: Wallet);
    get isMobile(): boolean;
    get wcName(): string;
    get wcEncoding(): BufferEncoding;
    get wcProjectId(): string;
    get wcMobile(): AppUrl;
    get accounts(): SimpleAccount[];
    deleteSession(topic: string): void;
    subscribeToEvents(): void;
    deleteInactivePairings(): Promise<void>;
    restorePairings(): void;
    get pairing(): PairingTypes.Struct | undefined;
    restoreSessions(): void;
    getSession(namespace: string, chainId: string): SessionTypes.Struct;
    get walletName(): string;
    get dappProjectId(): string;
    setActions(actions: WalletClientActions): void;
    setQRState(state: State): void;
    setQRError(e?: Error | string): void;
    init(): Promise<void>;
    initSignClient(): Promise<void>;
    initWCCloudInfo(): Promise<void>;
    initAppUrl(): Promise<void>;
    get nativeUrl(): string;
    get universalUrl(): string;
    get redirectHref(): string | undefined;
    get displayQRCode(): boolean;
    get redirect(): boolean;
    openApp(): void;
    connect(chainIds: string | string[]): Promise<void>;
    disconnect(): Promise<void>;
    getSimpleAccount(chainId: string): Promise<SimpleAccount>;
    getOfflineSignerAmino(chainId: string): OfflineAminoSigner;
    getOfflineSignerDirect(chainId: string): OfflineDirectSigner;
    getOfflineSigner(chainId: string): Promise<OfflineDirectSigner>;
    protected _getAccount(chainId: string): Promise<unknown>;
    getAccount(chainId: string): Promise<WalletAccount>;
    protected _signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<unknown>;
    signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse>;
    protected _signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<unknown>;
    signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse>;
}
