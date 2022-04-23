import { isValidObject } from '@vodyani/validator';
import { AsyncClientAdapter, CreateAsyncClientAdapter, FixedContext, isKeyof } from '@vodyani/core';

import { AsyncClientProxy } from '../common';

export class BaseAsyncClientProxy<T, O> implements AsyncClientProxy<T, O> {
  private client: AsyncClientAdapter<T>;

  private args: any[];

  private callback: CreateAsyncClientAdapter<T, O>;

  @FixedContext
  public get() {
    return this.client;
  }

  @FixedContext
  public getClient() {
    if (isValidObject(this.client) && isKeyof(this.client, 'instance')) {
      return this.client.instance;
    }

    return null;
  }

  @FixedContext
  public async deploy(
    callback: CreateAsyncClientAdapter<T, O>,
    option: O,
    ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = await callback(option, ...this.args);
  }

  @FixedContext
  public async redeploy(option: O) {
    const current = await this.callback(option, ...this.args);

    this.client.close();
    this.client = null;
    this.client = current;
  }

  @FixedContext
  public async close() {
    await this.client.close();
    this.client = null;
  }
}
