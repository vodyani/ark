import { Injectable, Inject } from '@nestjs/common';
import { convertArray } from '@vodyani/transformer';
import { CreateAsyncClientAdapter, FixedContext } from '@vodyani/core';

import { BaseAsyncClientProxy } from '../base';
import { AsyncClientProxyMap, DynamicDataSourceOptions } from '../common';

import { ArkManager } from './ark-manager';
import { ConfigProvider } from './config';
import { ConfigMonitor } from './config-monitor';

@Injectable()
export class AsyncDynamicDataSourceProvider <T = any, O = any> {
  private readonly store: AsyncClientProxyMap<T> = new Map();

  constructor(
    @Inject(ArkManager.token)
    private readonly config: ConfigProvider,
    private readonly monitor: ConfigMonitor,
  ) {}

  @FixedContext
  public get(configKey: string) {
    if (this.store.has(configKey)) {
      return this.store.get(configKey).get();
    }
  }

  @FixedContext
  public getClient(configKey: string) {
    if (this.store.has(configKey)) {
      return this.store.get(configKey).getClient();
    }
  }

  @FixedContext
  public async create(
    callback: CreateAsyncClientAdapter<T, O>,
    options: DynamicDataSourceOptions[],
  ) {
    if (!callback) {
      throw new Error('The creation callback cannot be empty');
    }

    if (!options) {
      throw new Error('The AsyncDynamicDataSource options cannot be empty');
    }

    for (const { configKey, args } of options) {
      const option = this.config.get(configKey);

      const clientProxy = new BaseAsyncClientProxy<T, O>();

      await clientProxy.deploy(callback, option, ...convertArray(args));

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
