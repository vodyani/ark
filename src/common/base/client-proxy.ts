import { FixedContext } from '@vodyani/core';

import { Client } from '../interface';
import { CreateClient } from '../type';

export class ClientProxy<CLIENT, OPTION> {
  private instance: Client<CLIENT>;

  private callback: CreateClient<CLIENT, OPTION>;

  @FixedContext
  public get() {
    return this.instance.client;
  }

  @FixedContext
  public deploy(callback: CreateClient<CLIENT, OPTION>, option: OPTION) {
    this.callback = callback;
    this.instance = callback(option);
  }

  @FixedContext
  public redeploy(option: OPTION) {
    const newInstance = this.callback(option);
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
