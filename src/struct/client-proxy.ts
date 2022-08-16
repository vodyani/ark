import { This } from '@vodyani/class-decorator';

import { Client, IClientProxy, CreateClient } from '../common';

export class ClientProxy<T = any, O = any> implements IClientProxy<T, O> {
  private args: any[];

  private client: Client<T>;

  private callback: CreateClient<T, O>;

  @This
  public get() {
    return this.client.get();
  }

  @This
  public getClient() {
    return this.client;
  }

  @This
  public deploy(
    callback: CreateClient<T, O>,
    option: O,
    ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = callback(option, ...this.args);
  }

  @This
  public redeploy(option: O) {
    const current = this.callback(option, ...this.args);

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
