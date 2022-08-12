import { AsyncClientAdapter, ClientAdapter } from './interface';

export type Dictionary<T = any> = { [P in keyof T]: T[P]; };

export type Method = (value: any) => void;

export type PromiseMethod = (value: any) => Promise<void>;

export type SubscribeCallback<T = any> = (config: Dictionary<T>) => any;
export type CreateClientAdapter<T = any, O = any> = (options: O, ...args: any[]) => ClientAdapter<T>;
export type CreateAsyncClientAdapter<T = any, O = any> = (options: O, ...args: any[]) => Promise<AsyncClientAdapter<T>>;
