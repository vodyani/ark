import { Provider } from '@nestjs/common';

import { AsyncClientProxyMap, ClientProxyMap } from './client-proxy';

export type DynamicDataSourceStore<CLIENT = Provider> = Map<any, ClientProxyMap<CLIENT>>;
export type AsyncDynamicDataSourceStore<CLIENT = Provider> = Map<any, AsyncClientProxyMap<CLIENT>>;
