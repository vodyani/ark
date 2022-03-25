import { WatchOptions } from 'chokidar';
import { BaseModule, BaseProvide } from '@vodyani/core';

import { RemoteConfigClientOptions } from './remote-client';

export interface LocalConfigOptions {
  path: string;
  params?: Record<string, any>;
  enableWatch?: boolean;
  watchOptions?: WatchOptions;
}

export interface RemoteConfigOptions {
  module: BaseModule;
  provider: BaseProvide;
  options: RemoteConfigClientOptions;
}

export interface ConfigManagerOptions {
  remote?: RemoteConfigOptions[];
  local?: LocalConfigOptions;
  defaultEnv?: string;
  env?: string;
}

export interface ConfigModuleOptions extends ConfigManagerOptions {
  global?: boolean;
}
