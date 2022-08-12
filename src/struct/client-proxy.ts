import { This } from '@vodyani/class-decorator';

import { ClientAdapter, ClientProxy, CreateClientAdapter } from '../common';

export class BaseClientProxy<T = any, O = any> implements ClientProxy<T, O> {
  private client: ClientAdapter<T>;

  private args: any[];

  private callback: CreateClientAdapter<T, O>;

  @This
  public get() {
    return this.client;
  }

  @This
  public getClient() {
    return this.client?.instance;
  }

  @This
  public deploy(
    callback: CreateClientAdapter<T, O>,
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
