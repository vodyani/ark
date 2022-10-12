import { ModuleMetadata } from '@nestjs/common';

import { IConfigClient, IConfigLoader } from './config';

export interface ConfigClientOptions {
  client: IConfigClient;
  loader: IConfigLoader;
  enablePolling?: boolean;
  enableSubscribe?: boolean;
}

export interface ConfigHandlerOptions<T = any> {
  args: T;
  clients?: ConfigClientOptions[];
  enableDynamicDataSource?: boolean;
}

export interface ArkOptions<T = any> extends ConfigHandlerOptions<T> {
  imports?: ModuleMetadata['imports'];
  global?: boolean;
}
