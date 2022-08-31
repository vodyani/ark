import { WatchOptions } from 'chokidar';
import { Type, DynamicModule, ForwardReference, Provider } from '@vodyani/core';

export interface EnvConfigOptions {
  current: any;
  default: any;
}

export interface LocalConfigOptions {
  env: EnvConfigOptions;
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
