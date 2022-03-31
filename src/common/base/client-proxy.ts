import { ClientAdapter, FixedContext, isKeyof, isValidObject } from '@vodyani/core';

import { CreateClientAdapter } from '../type';

export class ClientProxy<T = any, O = any> {
  private client: ClientAdapter<T>;

  private args: any[];

  private callback: CreateClientAdapter<T, O>;

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
  public deploy(
    callback: CreateClientAdapter<T, O>,
    option: O,
    ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = callback(option, ...this.args);
  }

  @FixedContext
  public redeploy(option: O) {
    const current = this.callback(option, ...this.args);

    this.client.close();
    this.client = null;
    this.client = current;
  }

  @FixedContext
  public close() {
    this.client.close();
    this.client = null;
  }
}
