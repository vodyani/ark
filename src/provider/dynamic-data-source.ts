import { Injectable, Provider, Inject } from '@nestjs/common';
import { FixedContext, getDefaultArray, isValid, isValidArray } from '@vodyani/core';

import { ClientProxy, ClientProxyMap, CreateClientCallback, DynamicDataSourceOptions } from '../common';

import { ArkManager } from './ark-manager';
import { ConfigProvider } from './config';
import { ConfigMonitor } from './config-monitor';

@Injectable()
export class DynamicDataSourceProvider <CLIENT = Provider, OPTION = any> {
  private readonly store: ClientProxyMap<CLIENT> = new Map();

  constructor(
    @Inject(ArkManager.token)
    private readonly config: ConfigProvider,
    private readonly monitor: ConfigMonitor,
  ) {}

  @FixedContext
  public discovery(configKey: string) {
    if (this.store.has(configKey)) {
      return this.store.get(configKey).get();
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
      throw new Error('The DynamicDataSource options cannot be empty');
    }

    for (const { configKey, args } of options) {
      const option = this.config.get(configKey);

      const clientProxy = new ClientProxy<CLIENT, OPTION>();

      clientProxy.deploy(callback, option, ...getDefaultArray(args));

      this.store.set(configKey, clientProxy);

      this.monitor.watchConfig(clientProxy.redeploy, configKey);
    }
  }

  @FixedContext
  public close(configKey: string) {
    if (this.store.has(configKey)) {
      this.store.get(configKey).close();
      this.store.delete(configKey);
    }
  }
}
