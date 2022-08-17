import { ArgumentValidator, Required, This } from '@vodyani/class-decorator';

import {
  AsyncClient,
  Client,
  CreateClient,
  CreateAsyncClient,
  IClientProxy,
  IAsyncClientProxy,
} from '../common';

export class ClientProxy<T = any, O = any> implements IClientProxy<T, O> {
  private args: any[];

  private client: Client<T>;

  private callback: CreateClient<T, O>;

  @This
  public getClient() {
    return this.client;
  }

  @This
  @ArgumentValidator()
  public deploy(
    @Required() callback: CreateClient<T, O>,
    @Required() options: O,
      ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = callback(options, ...this.args);
  }

  @This
  public redeploy(options: O) {
    const current = this.callback(options, ...this.args);

    this.client.close();
    this.client = null;
    this.client = current;
  }

  @This
  public close() {
    this.client.close();
    this.client = null;
  }
}

export class AsyncClientProxy<T, O> implements IAsyncClientProxy<T, O> {
  private args: any[];

  private client: AsyncClient<T>;

  private callback: CreateAsyncClient<T, O>;

  @This
  public getClient() {
    return this.client;
  }

  @This
  public async deploy(
    callback: CreateAsyncClient<T, O>,
    options: O,
    ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = await callback(options, ...this.args);
  }

  @This
  public async redeploy(options: O) {
    const current = await this.callback(options, ...this.args);

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

