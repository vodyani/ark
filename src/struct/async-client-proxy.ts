import { This } from '@vodyani/class-decorator';

import { AsyncClient, IAsyncClientProxy, CreateAsyncClient } from '../common';

export class AsyncClientProxy<T, O> implements IAsyncClientProxy<T, O> {
  private args: any[];

  private client: AsyncClient<T>;

  private callback: CreateAsyncClient<T, O>;

  @This
  public get() {
    return this.client.connect();
  }

  @This
  public getClient() {
    return this.client;
  }

  @This
  public async deploy(
    callback: CreateAsyncClient<T, O>,
    option: O,
    ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = await callback(option, ...this.args);
  }

  @This
  public async redeploy(option: O) {
    const current = await this.callback(option, ...this.args);

    this.client.close();
    this.client = null;
    this.client = current;
  }

  @This
  public async close() {
    await this.client.close();
    this.client = null;
  }
}
