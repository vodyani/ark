import { Injectable } from '@nestjs/common';
import { This } from '@vodyani/class-decorator';
import { IClientMediator, IClientAdapter, IConfigObserver, IConfigSubscriber } from '@vodyani/core';
import { CircularHandler, circular, toHash } from '@vodyani/utils';

import { ConfigProvider } from './config';

@Injectable()
export class AsyncDynamicDataSourceProvider<T = any, C = any> implements IClientMediator<T, C> {
  private readonly clients = new Map<string, IClientAdapter<T, C>>();

  private readonly keys = new Set<string>();

  constructor(
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

    this.clients.set(key, client);
    this.keys.add(key);
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

    this.clients.set(key, client);
    this.keys.add(key);
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

@Injectable()
export class DynamicDataSourceConfigObserver<T = any> implements IConfigObserver {
  private readonly subscribers = new Map<string, IConfigSubscriber>();

  private readonly hash = new Map<string, string>();

  private readonly keys = new Set<string>();

  private poller: CircularHandler;

  constructor(
    private readonly config: ConfigProvider<T>,
  ) {}

  @This
  public contrast(key: string, value: any) {
    const afterHash = toHash(value);
    const beforeHash = this.hash.get(key);

    if (afterHash !== beforeHash) {
      this.notify(key, value);
      this.hash.set(key, afterHash);
    }
  }

  @This
  public subscribe(key: string, subscriber: IConfigSubscriber) {
    const config = this.config.get(key);
    const hash = toHash(config);

    this.keys.add(key);
    this.hash.set(key, hash);
    this.subscribers.set(key, subscriber);
  }

  @This
  public notify(key: string, value: any) {
    const subscriber = this.subscribers.get(key);

    subscriber.update(key, value);
  }

  @This
  public polling() {
    this.poller = circular(this.circularContrast, 1000);
  }

  @This
  public unPolling() {
    this.poller.close();
    this.poller = null;
  }

  @This
  public unSubscribe(key: string) {
    this.subscribers.delete(key);
    this.keys.delete(key);
  }

  @This
  private circularContrast() {
    this.keys.forEach((key) => {
      const value = this.config.get(key);

      console.log(value);

      this.contrast(key, value);
    });
  }
}
