import { Client, AsyncClient } from '@vodyani/core';
import { Method, PromiseMethod } from '@vodyani/utils';

import { DeployClient, DeployAsyncClient } from '../type';

export interface IClientProxy<T = any, O = any> {
  getClient: () => Client<T>;
  deploy: DeployClient<T, O>;
  redeploy: (option: O) => void;
  close: Method<void>;
}

export interface IAsyncClientProxy<T = any, O = any> {
  getClient: () => AsyncClient<T>;
  deploy: DeployAsyncClient<T, O>;
  redeploy: (option: O) => Promise<void>;
  close: PromiseMethod<void>;
}
