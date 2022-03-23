import { Provider } from '@nestjs/common';

import { ClientProxy, AsyncClientProxy } from '../base';

export type ClientProxyMap<CLIENT = Provider> = Map<any, ClientProxy<CLIENT, any>>;
export type AsyncClientProxyMap<CLIENT = Provider> = Map<any, AsyncClientProxy<CLIENT, any>>;
export type DynamicDataSourceStore<CLIENT = Provider> = Map<any, ClientProxyMap<CLIENT>>;
export type AsyncDynamicDataSourceStore<CLIENT = Provider> = Map<any, AsyncClientProxyMap<CLIENT>>;
