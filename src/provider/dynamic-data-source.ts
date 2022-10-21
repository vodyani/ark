import { Inject, Injectable } from '@nestjs/common';
import { This } from '@vodyani/class-decorator';
import { IClientMediator, IClientAdapter } from '@vodyani/core';

import { ArkManager } from './ark-manager';
import { ConfigProvider } from './config';

const b = ArkManager.getToken();

@Injectable()
export class AsyncDynamicDataSourceProvider<T = any, C = any> implements IClientMediator<T, C> {
  private readonly clients = new Map<string, IClientAdapter<T, C>>();

  private readonly keys = new Set<string>();

  constructor(
    @Inject(b)
    private readonly config: ConfigProvider<C>,
  ) {}

  @This
  public async destroy(key: string) {
    const client = this.getClient(key);

    await client.close();

    this.clients.delete(key);
    this.keys.delete(key);
  }

  @This
  public async deploy(key: string, client: IClientAdapter<T, C>) {
    const config = this.config.get<C>(key);

    await client.create(config);

    this.clients.set(key, client);
    this.keys.add(key);
  }

  @This
  public async redeploy(key: string, config: C) {
    const client = this.getClient(key);
    await client.redeploy(config);
  }

  @This
  public getClient(key: string) {
    return this.clients.get(key);
  }

  @This
  public async update(key: string, value: any) {
    await this.redeploy(key, value);
  }
}

@Injectable()
export class DynamicDataSourceProvider<T = any, C = any> implements IClientMediator<T, C> {
  private readonly clients = new Map<string, IClientAdapter<T, C>>();

  private readonly keys = new Set<string>();

  constructor(
    @Inject(b)
    private readonly config: ConfigProvider<C>,
  ) {}

  @This
  public destroy(key: string) {
    const client = this.getClient(key);

    client.close();

    this.clients.delete(key);
    this.keys.delete(key);
  }

  @This
  public deploy(key: string, client: IClientAdapter<T, C>) {
    const config = this.config.get<C>(key);

    client.create(config);

    this.clients.set(key, client);
    this.keys.add(key);
  }

  @This
  public redeploy(key: string, config: C) {
    const client = this.getClient(key);
    client.redeploy(config);
  }

  @This
  public getClient(key: string) {
    return this.clients.get(key);
  }

  @This
  public update(key: string, value: any) {
    this.redeploy(key, value);
  }
}
