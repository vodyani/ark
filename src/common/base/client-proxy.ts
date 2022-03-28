import { Client, FixedContext, isKeyof, isValidObject } from '@vodyani/core';

import { CreateClientCallback } from '../type';

export class ClientProxy<CLIENT = any, OPTION = any> {
  private instance: Client<CLIENT>;

  private args: any[];

  private callback: CreateClientCallback<CLIENT, OPTION>;

  @FixedContext
  public get() {
    if (isValidObject(this.instance) && isKeyof('client', this.instance)) {
      return this.instance.client;
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
    this.instance = callback(option, ...this.args);
  }

  @FixedContext
  public redeploy(option: OPTION) {
    const newInstance = this.callback(option, ...this.args);

    this.instance.close();
    this.instance = null;
    this.instance = newInstance;
  }

  @FixedContext
  public close() {
    this.instance.close();
    this.instance = null;
  }
}
