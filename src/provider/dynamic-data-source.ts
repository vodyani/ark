import { Injectable, Inject } from '@nestjs/common';
import { CreateClientAdapter, FixedContext, getDefaultArray, isValid, isValidArray } from '@vodyani/core';

import { BaseClientProxy } from '../base';
import { ClientProxyMap, DynamicDataSourceOptions } from '../common';

import { ArkManager } from './ark-manager';
import { ConfigProvider } from './config';
import { ConfigMonitor } from './config-monitor';

@Injectable()
export class DynamicDataSourceProvider <T = any, O = any> {
  private readonly store: ClientProxyMap<T> = new Map();

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
  public create(
    callback: CreateClientAdapter<T, O>,
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

      const clientProxy = new BaseClientProxy<T, O>();

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
