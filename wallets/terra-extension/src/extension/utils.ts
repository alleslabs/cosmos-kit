import { ClientNotExistError } from '@cosmos-kit/core';
import { snakeCase } from 'snake-case';

import { TerraExtension } from './extension';

interface TerraWindow {
  isStationExtensionAvailable?: boolean;
}

export function prepareSignBytes(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(prepareSignBytes);
  }

  // string, number, or null
  if (typeof obj !== `object` || obj === null) {
    return obj;
  }

  const sorted: any = {};

  Object.keys(obj)
    .sort()
    .forEach((key) => {
      if (obj[key] === undefined || obj[key] === null) return;
      sorted[key] = prepareSignBytes(obj[key]);
    });
  return sorted;
}

export const getTerraFromExtension: () => Promise<
  TerraExtension | undefined
> = async () => {
  if (typeof window === 'undefined') {
    return void 0;
  }

  if (!(window as TerraWindow).isStationExtensionAvailable) {
    throw ClientNotExistError;
  }

  const terraExtension = new TerraExtension();
  await terraExtension.init();

  return terraExtension;
};

export const camelToSnake = (obj: object): object => {
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      newObj[snakeCase(key)] = value;
    }
  }
  return newObj;
};

export class FakeMsg {
  message: object;

  constructor(message: object) {
    this.message = message;
  }

  toJSON() {
    return JSON.stringify(prepareSignBytes(this.message));
  }
}
