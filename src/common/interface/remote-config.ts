import { PromiseMethod } from '@vodyani/utils';

import { RemoteSubscribe } from '../type';

export interface RemoteConfigClient {
  init: PromiseMethod<any>;
  sync?: PromiseMethod<any>;
  subscribe?: RemoteSubscribe;
  close?: PromiseMethod<any>;
}

export interface RemoteConfigInfo<O = any, E = any> {
  key: string;
  options?: O;
  extra?: E;
}
