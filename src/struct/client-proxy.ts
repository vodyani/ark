import { Client, AsyncClient } from '@vodyani/core';
import { ArgumentValidator, Required, This } from '@vodyani/class-decorator';

import { CreateClient, CreateAsyncClient, IClientProxy, IAsyncClientProxy } from '../common';

export class ClientProxy<I = any, O = any> implements IClientProxy<I, O> {
  private args: any[];
  private client: Client<I>;
  private callback: CreateClient<I, O>;

  @This
  public getClient() {
    return this.client;
  }

  @This
  @ArgumentValidator()
  public deploy(
    @Required() callback: CreateClient<I, O>,
    @Required() options: O,
      ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = callback(options, ...this.args);
  }

  @This
  @ArgumentValidator()
  public redeploy(
    @Required() options: O,
  ) {
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

export class AsyncClientProxy<I, O> implements IAsyncClientProxy<I, O> {
  private args: any[];
  private client: AsyncClient<I>;
  private callback: CreateAsyncClient<I, O>;

  @This
  public getClient() {
    return this.client;
  }

  @This
  @ArgumentValidator()
  public async deploy(
    @Required() callback: CreateAsyncClient<I, O>,
    @Required() options: O,
      ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = await callback(options, ...this.args);
  }

  @This
  @ArgumentValidator()
  public async redeploy(
    @Required() options: O,
  ) {
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

