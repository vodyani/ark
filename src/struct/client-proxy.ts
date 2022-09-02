import { Client, AsyncClient } from '@vodyani/core';
import { ArgumentValidator, Required, This } from '@vodyani/class-decorator';

import { CreateClient, CreateAsyncClient, IClientProxy, IAsyncClientProxy } from '../common';

export class ClientProxy<I = any, C = any> implements IClientProxy<I, C> {
  private args: any[];
  private client: Client<I>;
  private callback: CreateClient<I, C>;

  @This
  public getClient() {
    return this.client;
  }

  @This
  @ArgumentValidator()
  public deploy(
    @Required() callback: CreateClient<I, C>,
    @Required() config: C,
      ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = callback(config, ...this.args);
  }

  @This
  @ArgumentValidator()
  public redeploy(
    @Required() config: C,
  ) {
    const current = this.callback(config, ...this.args);
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

export class AsyncClientProxy<I, C> implements IAsyncClientProxy<I, C> {
  private args: any[];
  private client: AsyncClient<I>;
  private callback: CreateAsyncClient<I, C>;

  @This
  public getClient() {
    return this.client;
  }

  @This
  @ArgumentValidator()
  public async deploy(
    @Required() callback: CreateAsyncClient<I, C>,
    @Required() config: C,
      ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = await callback(config, ...this.args);
  }

  @This
  @ArgumentValidator()
  public async redeploy(
    @Required() config: C,
  ) {
    const current = await this.callback(config, ...this.args);
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
