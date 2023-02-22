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

  // -----debugging code-----
  const onMessage = (event) => {
    const message = event?.data;
    if (event.origin !== location.origin) return;
    if (event.source !== window) return;
    if (typeof message !== 'object') return;
    if (message.target !== `station:inpage`) return;
    if (!message.data) return;

    if (message.data === 'ACK') {
      // window.postMessage(
      //   { target: `station:content`, data: 'ACK' },
      //   location.origin
      // );
      console.log('Received!!!');
      console.log('message', JSON.stringify(message));
      console.log('---------------------------------');
    }
  };
  window.addEventListener('message', onMessage);
  // -----debugging code-----

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
