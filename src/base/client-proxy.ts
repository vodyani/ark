import { ClientAdapter, CreateClientAdapter, FixedContext, isKeyof, isValidObject } from '@vodyani/core';

import { ClientProxy } from '../common';

export class BaseClientProxy<T = any, O = any> implements ClientProxy<T, O> {
  private client: ClientAdapter<T>;

  private args: any[];

  private callback: CreateClientAdapter<T, O>;

  @FixedContext
  public get() {
    return this.client;
  }

  @FixedContext
  public getClient() {
    return isValidObject(this.client) && isKeyof(this.client, 'instance') ? this.client.instance : null;
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
