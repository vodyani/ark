import { AsyncClientAdapter, FixedContext, isKeyof, isValidObject } from '@vodyani/core';

import { AsyncCreateClientAdapter } from '../type';

export class AsyncClientProxy<T, O> {
  private client: AsyncClientAdapter<T>;

  private args: any[];

  private callback: AsyncCreateClientAdapter<T, O>;

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
    callback: AsyncCreateClientAdapter<T, O>,
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
