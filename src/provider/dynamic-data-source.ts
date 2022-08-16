import { AsyncInject } from '@vodyani/core';
import { This } from '@vodyani/class-decorator';
import { Injectable, Inject } from '@nestjs/common';

import { AsyncClientProxy, ClientProxy } from '../struct';
import { CreateAsyncClient, CreateClient, DynamicDataSourceOptions } from '../common';

import { ArkManager } from './manager';
import { ConfigProvider } from './config';
import { ConfigMonitor } from './monitor';

@Injectable()
export class DynamicDataSourceProvider <T = any, O = any> {
  private readonly store = new Map();

  constructor(
    @Inject(ArkManager.token)
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
  public deploy(
    callback: CreateClient<T, O>,
    options: DynamicDataSourceOptions[],
  ) {
    if (!callback) {
      throw new Error('The creation callback cannot be empty');
    }

    if (!options) {
      throw new Error('The DynamicDataSource options cannot be empty');
    }

    for (const { key, args } of options) {
      const option = this.config.get(key);

      const clientProxy = new ClientProxy<T, O>();

      clientProxy.deploy(callback, option, ...(args || []));

      this.store.set(key, clientProxy);

      this.monitor.watchConfig(clientProxy.redeploy, key);
    }
  }

  @This
  public close(configKey: string) {
    if (this.store.has(configKey)) {
      this.store.get(configKey).close();
      this.store.delete(configKey);
    }
  }
}

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
  public async deploy(
    callback: CreateAsyncClient<T, O>,
    options: DynamicDataSourceOptions[],
  ) {
    if (!callback) {
      throw new Error('The creation callback cannot be empty');
    }

    if (!options) {
      throw new Error('The AsyncDynamicDataSource options cannot be empty');
    }

    for (const { key, args } of options) {
      const option = this.config.get(key);

      const clientProxy = new AsyncClientProxy<T, O>();

      await clientProxy.deploy(callback, option, ...(args || []));

      this.store.set(key, clientProxy);

      this.monitor.watchConfig(clientProxy.redeploy, key);
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
