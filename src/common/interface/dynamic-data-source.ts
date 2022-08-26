import { Method, PromiseMethod } from '@vodyani/utils';

import { DeployAsyncClient, DeployClient } from '../type';

export interface Client<T = any> {
  getInstance: Method<T>;
  close: Method<void>;
}

export interface AsyncClient<T = any> {
  getInstance: Method<T>;
  close: PromiseMethod<void>;
}

export interface ClientAdapter<T = any, O = any> {
  getClient: (key: string) => Client<T>;
  create: (options: O) => Client<T>;
}

export interface AsyncClientAdapter<T = any, O = any> {
  getClient: (key: string) => AsyncClient<T>;
  create: (options: O) => Promise<AsyncClient<T>>;
}

export interface IClientProxy<T = any, O = any> {
  getClient: () => Client<T>;
  deploy: DeployClient<T, O>;
  redeploy: (option: O) => void;
  close: Method<void>;
}

export interface IAsyncClientProxy<T = any, O = any> {
  getClient: () => AsyncClient<T>;
  deploy: DeployAsyncClient<T, O>;
  redeploy: (option: O) => Promise<void>;
  close: PromiseMethod<void>;
}

export interface DynamicDataSourceOptions {
  configKey: string,
  args?: any[],
}
