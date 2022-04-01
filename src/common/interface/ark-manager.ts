import { WatchOptions } from 'chokidar';
import { BaseModule, BaseProvide } from '@vodyani/core';

export interface LocalConfigOptions {
  path: string;
  param?: Record<string, any>;
  enableWatch?: boolean;
  watchOptions?: WatchOptions;
}

export interface RemoteConfigOptions {
  path: string;
  args?: any[];
  module: BaseModule;
  provider: BaseProvide;
  enableSubscribe?: boolean;
  enableCycleSync?: boolean;
  cycleSyncInterval?: number;
}

export interface ArkManagerOptions {
  remote?: RemoteConfigOptions[];
  local: LocalConfigOptions;
  defaultEnv: string;
  env: string;
}

export interface ArkModuleOptions extends ArkManagerOptions {
  global?: boolean;
}
