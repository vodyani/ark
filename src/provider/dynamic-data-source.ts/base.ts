import { Injectable, Provider, Inject } from '@nestjs/common';
import { FixedContext, getDefaultArray, isValid, isValidArray } from '@vodyani/core';

import { ConfigProvider } from '../config';
import { ConfigMonitor } from '../monitor/base';
import { ConfigManager } from '../config-manager';
import { ClientProxy, ClientProxyMap, CreateClientCallback, DynamicDataSourceOptions } from '../../common';

@Injectable()
export class DynamicDataSourceProvider <CLIENT = Provider, OPTION = Record<string, any>> {
  private readonly store: ClientProxyMap<CLIENT> = new Map();

  constructor(
    @Inject(ConfigManager.token)
    private readonly config: ConfigProvider,
    private readonly monitor: ConfigMonitor,
  ) {}

  @FixedContext
  public discovery(key: string) {
    if (this.store.has(key)) {
      return this.store.get(key).get();
    }
  }

  @FixedContext
  public create(
    callback: CreateClientCallback<CLIENT, OPTION>,
    options: DynamicDataSourceOptions[],
  ) {
    if (!isValid(callback)) {
      throw new Error('The creation callback cannot be empty');
    }

    if (!isValidArray(options)) {
      throw new Error('The dynamicDataSource options cannot be empty');
    }

    for (const { configKey, args } of options) {
      const option = this.config.get(configKey);

      const clientProxy = new ClientProxy<CLIENT, OPTION>();

      clientProxy.deploy(callback, option, getDefaultArray(args));

      this.store.set(configKey, clientProxy);

      this.monitor.watch(clientProxy.redeploy, configKey);
    }
  }
}
