import { TerraExtension } from './extension';
export declare function prepareSignBytes(obj: any): any;
export declare const getTerraFromExtension: () => Promise<TerraExtension | undefined>;
export declare const camelToSnake: (obj: object) => object;
export declare class FakeMsg {
    message: object;
    constructor(message: object);
    toJSON(): string;
}
