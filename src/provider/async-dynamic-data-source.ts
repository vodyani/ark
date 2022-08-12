import { Injectable } from '@nestjs/common';
import { AsyncInject } from '@vodyani/core';
import { This } from '@vodyani/class-decorator';

import { BaseAsyncClientProxy } from '../struct';
import { CreateAsyncClientAdapter, DynamicDataSourceOptions } from '../common';

import { ArkManager } from './ark-manager';
import { ConfigProvider } from './config';
import { ConfigMonitor } from './config-monitor';

@Injectable()
export class AsyncDynamicDataSourceProvider <T = any, O = any> {
  private readonly store = new Map();

  constructor(
    @AsyncInject(ArkManager)
    private readonly config: ConfigProvider,
    private readonly monitor: ConfigMonitor,
  ) {}

  @This
  public get(configKey: string) {
    if (this.store.has(configKey)) {
      return this.store.get(configKey).get();
    }
  }

  @This
  public getClient(configKey: string) {
    if (this.store.has(configKey)) {
      return this.store.get(configKey).getClient();
    }
  }

  @This
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

      await clientProxy.deploy(callback, option, ...(args || []));

      this.store.set(configKey, clientProxy);

      this.monitor.watchConfig(clientProxy.redeploy, configKey);
    }
  }

  @This
  public async close(configKey: string) {
    if (this.store.has(configKey)) {
      await this.store.get(configKey).close();
      this.store.delete(configKey);
    }
  }
}
