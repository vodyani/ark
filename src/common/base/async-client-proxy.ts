import { AsyncClient, FixedContext, isKeyof, isValidObject } from '@vodyani/core';

import { AsyncCreateClientCallback } from '../type';

export class AsyncClientProxy<CLIENT, OPTION> {
  private client: AsyncClient<CLIENT>;

  private args: any[];

  private callback: AsyncCreateClientCallback<CLIENT, OPTION>;

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
  public async deploy(
    callback: AsyncCreateClientCallback<CLIENT, OPTION>,
    option: OPTION,
    ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.client = await callback(option, ...this.args);
  }

  @FixedContext
  public async redeploy(option: OPTION) {
    const current = await this.callback(option, ...this.args);

    this.client.close();
    this.client = null;
    this.client = current;
  }

  @FixedContext
  public async close() {
    await this.client.close();
    this.client = null;
  }
}
