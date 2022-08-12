import { WatchOptions } from 'chokidar';
import { DynamicModule, ForwardReference, Provider, Type } from '@nestjs/common';

import { SubscribeCallback } from '../type';

export interface Env {
  current: any;
  default: any;
}

export interface LocalConfigOptions {
  env: Env;
  path: string;
  params: Record<string, any>;
  enableWatch?: boolean;
  watchOptions?: WatchOptions;
}

export interface RemoteConfigOptions {
  module: Type | DynamicModule | Promise<DynamicModule> | ForwardReference;
  provider: Provider;
  initArgs?: any[];
  enableSubscribe?: boolean;
  enableCycleSync?: boolean;
  cycleSyncInterval?: number;
}

export interface ArkManagerOptions {
  remote?: RemoteConfigOptions[];
  local: LocalConfigOptions;
}

export interface ArkModuleOptions extends ArkManagerOptions {
  /**
   * @default: true
   */
  global?: boolean;
}

export interface AnyAdapter {
  [key: string]: any;
}

export interface ClientAdapter<T = any> extends AnyAdapter {
  instance: T;
  close: (...arg: any) => any;
}

export interface AsyncClientAdapter<T = any> extends AnyAdapter {
  instance: T;
  close: (...arg: any) => Promise<any>;
}

export interface ClientAdapterProvider<T = any, O = any> {
  create: (options: O) => ClientAdapter<T>;
  connect: (key: string) => T;
}

export interface AsyncClientAdapterProvider<O = any, T = any> {
  create: (options: O) => Promise<AsyncClientAdapter<T>>;
  connect: (key: string) => T;
}

export interface RemoteConfigClient {
  init: (...args: any[]) => Promise<any>;
  sync?: (...args: any[]) => Promise<any>;
  subscribe?: SubscribeCallback;
  close?: (...args: any[]) => Promise<any>;
}

export interface RemoteConfigDetails<OPTIONS = any, EXTRA = any> {
  key: string;
  options?: OPTIONS;
  extra?: EXTRA;
}
