import { Client, AsyncClient } from './client';

export interface ClientProvider<CLIENT = any, OPTION = any> {
  create: (option: OPTION) => Client<CLIENT>;
  connect: (key: keyof OPTION) => CLIENT;
}
export interface AsyncClientProvider<CLIENT = any, OPTION = any> {
  create: (option: OPTION) => Promise<AsyncClient<CLIENT>>;
  connect: (key: keyof OPTION) => CLIENT;
}
