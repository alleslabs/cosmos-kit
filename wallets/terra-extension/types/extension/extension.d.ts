import { Tx, ExtensionOptions } from '@terra-money/feather.js';
import { NetworkInfo } from './types';
declare type ConnectResponse = {
    address?: string;
};
declare type InfoResponse = Record<string, NetworkInfo>;
declare type SignResponse = {
    payload: {
        result: Tx.Data;
    };
};
export declare class TerraExtension {
    private extension;
    identifier: string;
    _inTransactionProgress: boolean;
    connectResolvers: Set<[(data: any) => void, (error: any) => void]>;
    infoResolvers: Set<[(data: any) => void, (error: any) => void]>;
    signResolvers: Map<number, [(data: any) => void, (error: any) => void]>;
    constructor();
    get isAvailable(): boolean;
    init(): Promise<void>;
    connect(): Promise<ConnectResponse>;
    info(): Promise<InfoResponse>;
    disconnect(): Promise<void>;
    sign({ purgeQueue, ...data }: ExtensionOptions): Promise<SignResponse>;
    private onResponse;
}
export {};
