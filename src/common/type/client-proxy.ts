import { ClientProxy, AsyncClientProxy } from '../abstract';

export type ClientProxyMap<T = any, O = any > = Map<any, ClientProxy<T, O>>;
export type AsyncClientProxyMap<T = any, O = any > = Map<any, AsyncClientProxy<T, O>>;
