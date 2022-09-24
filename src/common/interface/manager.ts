import { WatchOptions } from 'chokidar';
import { Type, DynamicModule, ForwardReference, Provider } from '@nestjs/common';

export interface EnvConfigOptions {
  /**
   * An identification of the current environment.
   */
  current: string;
  /**
   * The identity of the default environment that will be used for merging.
   */
  default: string;
}

export interface LocalConfigOptions {
  /**
   * The environment variable of configuration information.
   */
  env: EnvConfigOptions;
  /**
   * The path of local configuration directory.
   */
  path: string;
  /**
   * The parameters of initialize configuration information.
   */
  params: Partial<any>;
  /**
   * The boolean of enable local config watch method.
   */
  enableWatch?: boolean;
  /**
   * The options for file listening.
   */
  watchOptions?: WatchOptions;
}

export interface RemoteConfigSubscribeInfo {
  /**
   * The key information in the remote config center.
   */
  key: string;
  /**
   * The arguments of use in remote config center subscribe.
   */
  args?: any[];
}

export interface RemoteConfigOptions {
  /**
   * The module of remote config center.
   */
  import: Type | DynamicModule | Promise<DynamicModule> | ForwardReference;
  /**
   * The provider of remote config center.
   */
  provider: Provider;
  /**
   * The arguments of init remote config center subscribe.
   */
  args?: any[];
  /**
   * The boolean of enable remote config center subscribe method.
   */
  enableSubscribe?: boolean;
  /**
   * The boolean of enable remote config center cycle sync.
   */
  enableCycleSync?: boolean;
  /**
   * Periodic synchronization interval. The default value is `1000` milliseconds.
   */
  cycleSyncInterval?: number;
}

export interface ArkManagerOptions {
  local: LocalConfigOptions;
  remote?: RemoteConfigOptions[];
}

export interface ArkModuleOptions extends ArkManagerOptions {
  /**
   * Is global module
   *
   * @default: true
   */
  global?: boolean;
}
