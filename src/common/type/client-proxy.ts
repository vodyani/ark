import { AsyncClientAdapter, ClientAdapter } from '@vodyani/core';

import { ClientProxy, AsyncClientProxy } from '../abstract';

export type CreateClientAdapter<T, O> = (options: O, ...args: any[]) => ClientAdapter<T>;
export type AsyncCreateClientAdapter<T, O> = (options: O, ...args: any[]) => Promise<AsyncClientAdapter<T>>;

export type ClientProxyMap<T = any, O = any > = Map<any, ClientProxy<T, O>>;
export type AsyncClientProxyMap<T = any, O = any > = Map<any, AsyncClientProxy<T, O>>;
