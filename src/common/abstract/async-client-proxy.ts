import { AsyncClientAdapter } from '../interface';
import { CreateAsyncClientAdapter } from '../type';

export abstract class AsyncClientProxy<T = any, O = any> {
  public get: () => AsyncClientAdapter<T>;
  public getClient: () => T;
  public deploy: (callback: CreateAsyncClientAdapter<T, O>, option: O, ...args: any[]) => Promise<void>;
  public redeploy: (option: O) => Promise<void>;
  public close: () => Promise<void>;
}
