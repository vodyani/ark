import { Provider } from '@nestjs/common';
import { AsyncClient, Client } from '@vodyani/core';

import { ClientProxy, AsyncClientProxy } from '../base';

export type CreateClientCallback<CLIENT, OPTION> = (options: OPTION, ...args: any[]) => Client<CLIENT>;
export type AsyncCreateClientCallback<CLIENT, OPTION> = (options: OPTION, ...args: any[]) => Promise<AsyncClient<CLIENT>>;

export type ClientProxyMap<CLIENT = Provider> = Map<any, ClientProxy<CLIENT, any>>;
export type AsyncClientProxyMap<CLIENT = Provider> = Map<any, AsyncClientProxy<CLIENT, any>>;
