import { AsyncClient, Client } from './interface';

export type Method<T = any> = (...args: any[]) => T;
export type PromiseMethod<T = any> = (...args: any[]) => Promise<T>;

export type Dictionary<T = any> = { [P in keyof T]: T[P]; };

export type RemoteSubscribe<T = any> = (config: Dictionary<T>) => any;

export type CreateClient<T = any, O = any> = (options: O, ...args: any[]) => Client<T>;
export type DeployClient<T = any, O = any> = (callback: CreateClient<T, O>, option: O, ...args: any[]) => void;

export type CreateAsyncClient<T = any, O = any> = (options: O, ...args: any[]) => Promise<AsyncClient<T>>;
export type DeployAsyncClient<T = any, O = any> = (callback: CreateAsyncClient<T, O>, option: O, ...args: any[]) => Promise<void>;