import { toConvert } from '@vodyani/utils';
import { Injectable } from '@nestjs/common';
import { AsyncInject } from '@vodyani/core';
import { ArgumentValidator, Required, This } from '@vodyani/class-decorator';

import {
  Client,
  CreateClient,
  CreateAsyncClient,
  DynamicDataSourceOptions,
  IClientProxy,
  IAsyncClientProxy,
  AsyncClient,
} from '../common';
import { AsyncClientProxy, ClientProxy } from '../struct';

import { ArkManager } from './manager';
import { ConfigMonitor } from './monitor';
import { ConfigProvider } from './config';

@Injectable()
export class DynamicDataSourceProvider<T = any, O = any> {
  private readonly store: Map<string, IClientProxy<T>> = new Map();

  constructor(
    @AsyncInject(ArkManager)
    private readonly config: ConfigProvider,
    private readonly monitor: ConfigMonitor,
  ) {}

  @This
  public getInstance(key: string): T {
    return this.getClient(key)?.getInstance() || null;
  }

  @This
  public getClient(key: string): Client<T> {
    return this.store.has(key) ? this.store.get(key).getClient() : null;
  }

  @This
  @ArgumentValidator()
  public deploy(
    @Required() callback: CreateClient<T, O>,
    @Required() callbackOptions: DynamicDataSourceOptions,
  ) {
    const { configKey, args } = callbackOptions;

    const currentArgs = toConvert(args, { default: [] });
    const options = this.config.get(configKey);
    const proxy = new ClientProxy<T, O>();

    proxy.deploy(callback, options, ...currentArgs);

    this.store.set(configKey, proxy);
    this.monitor.watchConfig(proxy.redeploy, configKey);
  }

  @This
  public clear(key: string) {
    if (this.store.has(key)) {
      this.store.get(key).close();
      this.store.delete(key);
    }
  }
}

@Injectable()
export class AsyncDynamicDataSourceProvider<T = any, O = any> {
  private readonly store = new Map<string, IAsyncClientProxy<T, O>>();

  constructor(
    @AsyncInject(ArkManager)
    private readonly config: ConfigProvider,
    private readonly monitor: ConfigMonitor,
  ) {}

  @This
  public getInstance(key: string): T {
    return this.getClient(key)?.getInstance() || null;
  }

  @This
  public getClient(key: string): AsyncClient<T> {
    return this.store.has(key) ? this.store.get(key).getClient() : null;
  }

  @This
  @ArgumentValidator()
  public async deploy(
    @Required() callback: CreateAsyncClient<T, O>,
    @Required() callbackOptions: DynamicDataSourceOptions,
  ) {
    const { configKey, args } = callbackOptions;

    const currentArgs = toConvert(args, { default: [] });
    const option = this.config.get(configKey);
    const proxy = new AsyncClientProxy<T, O>();

    await proxy.deploy(callback, option, ...currentArgs);

    this.store.set(configKey, proxy);
    this.monitor.watchConfig(proxy.redeploy, configKey);
  }

  @This
  public async clear(key: string) {
    if (this.store.has(key)) {
      await this.store.get(key).close();
      this.store.delete(key);
    }
  }
}
