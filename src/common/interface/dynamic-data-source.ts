import { DeployAsyncClient, DeployClient, Method, PromiseMethod, RemoteSubscribe } from '../type';

export interface Client<T = any> {
  connect: () => T;
  close: Method<any>;
}

export interface AsyncClient<T = any> {
  connect: () => T;
  close: PromiseMethod<any>;
}

export interface ClientAdapter<T = any, O = any> {
  connect: (key: string) => T;
  create: (options: O) => Client<T>;
}

export interface AsyncClientAdapter<O = any, T = any> {
  connect: (key: string) => T;
  create: (options: O) => Promise<AsyncClient<T>>;
}

export interface IClientProxy<T = any, O = any> {
  get: () => T;
  getClient: () => Client<T>;

  deploy: DeployClient<T, O>;
  redeploy: (option: O) => void;

  close: Method<void>;
}

export interface IAsyncClientProxy<T = any, O = any> {
  get: () => T;
  getClient: () => AsyncClient<T>;

  deploy: DeployAsyncClient<T, O>;
  redeploy: (option: O) => Promise<void>;

  close: PromiseMethod<void>;
}

export interface DynamicDataSourceOptions {
  key: string,
  args?: any[],
}

export interface RemoteConfigClient {
  init: PromiseMethod<any>;
  sync?: PromiseMethod<any>;
  subscribe?: RemoteSubscribe;
  close?: PromiseMethod<any>;
}

export interface RemoteConfigInfo<O = any, E = any> {
  key: string;
  options?: O;
  extra?: E;
}
