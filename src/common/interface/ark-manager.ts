import { Class } from '@vodyani/core';
import { WatchOptions } from 'chokidar';
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
  module: Class | DynamicModule | Promise<DynamicModule> | ForwardReference;
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
