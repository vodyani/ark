import { Provider } from '@nestjs/common';
import { AsyncClientAdapter, ClientAdapter } from '@vodyani/core';

import { ClientProxy, AsyncClientProxy } from '../base';

export type CreateClientAdapter<T, O> = (options: O, ...args: any[]) => ClientAdapter<T>;
export type AsyncCreateClientAdapter<T, O> = (options: O, ...args: any[]) => Promise<AsyncClientAdapter<T>>;

export type ClientProxyMap<T = Provider> = Map<any, ClientProxy<T, any>>;
export type AsyncClientProxyMap<T = Provider> = Map<any, AsyncClientProxy<T, any>>;
