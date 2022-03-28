import { Injectable, Provider, Inject } from '@nestjs/common';
import { FixedContext, getDefaultArray, isValid, isValidArray } from '@vodyani/core';

import { AsyncClientProxy, AsyncClientProxyMap, AsyncCreateClientCallback, DynamicDataSourceOptions } from '../common';

import { ConfigProvider } from './config';
import { ArkManager } from './config-manager';
import { ConfigMonitor } from './config-monitor';

@Injectable()
export class AsyncDynamicDataSourceProvider <CLIENT = Provider, OPTION = any> {
  private readonly store: AsyncClientProxyMap<CLIENT> = new Map();

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
  public async create(
    callback: AsyncCreateClientCallback<CLIENT, OPTION>,
    options: DynamicDataSourceOptions[],
  ) {
    if (!isValid(callback)) {
      throw new Error('The creation callback cannot be empty');
    }

    if (!isValidArray(options)) {
      throw new Error('The AsyncDynamicDataSource options cannot be empty');
    }

    for (const { configKey, args } of options) {
      const option = this.config.get(configKey);

      const clientProxy = new AsyncClientProxy<CLIENT, OPTION>();

      await clientProxy.deploy(callback, option, ...getDefaultArray(args));

      this.store.set(configKey, clientProxy);

      this.monitor.watchConfig(clientProxy.redeploy, configKey);
    }
  }

  @FixedContext
  public async close(configKey: string) {
    if (this.store.has(configKey)) {
      await this.store.get(configKey).close();
      this.store.delete(configKey);
    }
  }
}
