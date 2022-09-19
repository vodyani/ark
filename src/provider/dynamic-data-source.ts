import { toConvert } from '@vodyani/utils';
import { ArgumentValidator, Required, This } from '@vodyani/class-decorator';
import { AsyncClient, AsyncInject, Client, Injectable } from '@vodyani/core';

import { AsyncClientProxy, ClientProxy } from '../struct';
import { CreateClient, CreateAsyncClient, IClientProxy, IAsyncClientProxy } from '../common';

import { ArkManager } from './manager';
import { ConfigMonitor } from './monitor';
import { ConfigProvider } from './config';

@Injectable()
export class DynamicDataSourceProvider<T = any, O = any> {
  private readonly store: Map<string, IClientProxy<T, Partial<O>>> = new Map();

  constructor(
    @AsyncInject(ArkManager)
    private readonly config: ConfigProvider,
    private readonly monitor: ConfigMonitor,
  ) {}

  @This
  @ArgumentValidator()
  public getInstance(@Required() key: string): T {
    return this.getClient(key)?.getInstance() || null;
  }

  @This
  @ArgumentValidator()
  public getClient(@Required() key: string): Client<T> {
    return this.store.has(key) ? this.store.get(key).getClient() : null;
  }

  @This
  @ArgumentValidator()
  public deploy(
    @Required() create: CreateClient<T, Partial<O>>,
    @Required() configKey: string,
      ...args: any[]
  ) {
    const currentArgs = toConvert(args, { default: [] });
    const options = this.config.match(configKey);
    const proxy = new ClientProxy<T, Partial<O>>();

    proxy.deploy(create, options, ...currentArgs);

    this.store.set(configKey, proxy);
    this.monitor.setCheck(proxy.redeploy, configKey);
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
  private readonly store = new Map<string, IAsyncClientProxy<T, Partial<O>>>();

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
    @Required() create: CreateAsyncClient<T, Partial<O>>,
    @Required() configKey: string,
      ...args: any[]
  ) {
    const currentArgs = toConvert(args, { default: [] });
    const option = this.config.match(configKey);
    const proxy = new AsyncClientProxy<T, Partial<O>>();

    await proxy.deploy(create, option, ...currentArgs);

    this.store.set(configKey, proxy);
    this.monitor.setCheck(proxy.redeploy, configKey);
  }

  @This
  public async close(key: string) {
    if (this.store.has(key)) {
      await this.store.get(key).close();
      this.store.delete(key);
    }
  }
}
