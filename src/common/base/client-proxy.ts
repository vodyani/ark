import { Client, FixedContext, isKeyof, isValidObject } from '@vodyani/core';

import { CreateClientCallback } from '../type';

export class ClientProxy<CLIENT = any, OPTION = any> {
  private client: Client<CLIENT>;

  private args: any[];

  private callback: CreateClientCallback<CLIENT, OPTION>;

  @FixedContext
  public get() {
    return this.client;
  }

  @FixedContext
  public getClient() {
    if (isValidObject(this.client) && isKeyof('instance', this.client)) {
      return this.client.instance;
    }

    return null;
  }

  @FixedContext
  public deploy(
    callback: CreateClientCallback<CLIENT, OPTION>,
    option: OPTION,
    ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = callback(option, ...this.args);
  }

  @FixedContext
  public redeploy(option: OPTION) {
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
