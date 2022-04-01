import { AsyncClientAdapter, AsyncCreateClientAdapter } from '@vodyani/core';

export abstract class AsyncClientProxy<T = any, O = any> {
  public get: () => AsyncClientAdapter<T>;
  public getClient: () => T;
  public deploy: (callback: AsyncCreateClientAdapter<T, O>, option: O, ...args: any[]) => Promise<void>;
  public redeploy: (option: O) => Promise<void>;
  public close: () => Promise<void>;
}