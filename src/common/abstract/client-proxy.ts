import { ClientAdapter } from '../interface';
import { CreateClientAdapter } from '../type';

export abstract class ClientProxy<T = any, O = any> {
  public get: () => ClientAdapter<T>;
  public getClient: () => T;
  public deploy: (callback: CreateClientAdapter<T, O>, option: O, ...args: any[]) => void;
  public redeploy: (option: O) => void;
  public close: () => void;
}
