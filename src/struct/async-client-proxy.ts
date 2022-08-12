import { This } from '@vodyani/class-decorator';

import { AsyncClientAdapter, AsyncClientProxy, CreateAsyncClientAdapter } from '../common';

export class BaseAsyncClientProxy<T, O> implements AsyncClientProxy<T, O> {
  private client: AsyncClientAdapter<T>;

  private args: any[];

  private callback: CreateAsyncClientAdapter<T, O>;

  @This
  public get() {
    return this.client;
  }

  @This
  public getClient() {
    return this.client?.instance;
  }

  @This
  public async deploy(
    callback: CreateAsyncClientAdapter<T, O>,
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
