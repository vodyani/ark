import { WatchOptions } from 'chokidar';
import { BaseClass } from '@vodyani/core';
import { DynamicModule, ForwardReference, Provider } from '@nestjs/common';

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
  module: BaseClass | DynamicModule | Promise<DynamicModule> | ForwardReference;
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
  global?: boolean;
}
