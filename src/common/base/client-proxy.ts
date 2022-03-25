import { FixedContext } from '@vodyani/core';

import { Client } from '../interface';
import { CreateClientCallback } from '../type';

export class ClientProxy<CLIENT, OPTION> {
  private instance: Client<CLIENT>;

  private args: any[];

  private callback: CreateClientCallback<CLIENT, OPTION>;

  @FixedContext
  public get() {
    return this.instance.client;
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
