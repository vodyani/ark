import { AsyncClient, Client } from '@vodyani/core';

export type CreateClient<T = any, O = any> = (options: O, ...args: any[]) => Client<T>;
export type CreateAsyncClient<T = any, O = any> = (options: O, ...args: any[]) => Promise<AsyncClient<T>>;
export type DeployClient<T = any, O = any> = (callback: CreateClient<T, O>, options: O, ...args: any[]) => void;
export type DeployAsyncClient<T = any, O = any> = (callback: CreateAsyncClient<T, O>, options: O, ...args: any[]) => Promise<void>;
