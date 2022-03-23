import { Client, AsyncClient } from '../interface/client';

export type CreateClient<CLIENT, OPTION> = (options: OPTION, ...args: any[]) => Client<CLIENT>;
export type AsyncCreateClient<CLIENT, OPTION> = (options: OPTION, ...args: any[]) => Promise<AsyncClient<CLIENT>>;
