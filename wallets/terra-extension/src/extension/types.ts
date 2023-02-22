export interface NetworkInfo {
  baseAsset: string;
  chainID: string;
  coinType: string;
  gasAdjustment: number;
  gasPrices: Record<string, number>; // revisit
  icon: string;
  lcd: string;
  name: string;
  prefix: string;
}
