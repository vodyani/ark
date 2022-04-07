import { WatchOptions } from 'chokidar';
import { ModuleMetadata } from '@nestjs/common';

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
  module: ModuleMetadata['imports'];
  provider: ModuleMetadata['providers'];
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
