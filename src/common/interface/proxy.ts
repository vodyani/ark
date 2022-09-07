import { Client, AsyncClient } from '@vodyani/core';

import { DeployClient, DeployAsyncClient } from '../type';

export interface IClientProxy<T = any, O = any> {
  getClient: () => Client<T>;
  deploy: DeployClient<T, O>;
  redeploy: (option: O) => void;
  close: (...args: any[]) => any;
}

export interface IAsyncClientProxy<T = any, O = any> {
  getClient: () => AsyncClient<T>;
  deploy: DeployAsyncClient<T, O>;
  redeploy: (option: O) => Promise<void>;
  close: (...args: any[]) => Promise<any>;
}
