import { FixedContext } from '@vodyani/core';

import { AsyncClient } from '../interface';
import { AsyncCreateClientCallback } from '../type';

export class AsyncClientProxy<CLIENT, OPTION> {
  private instance: AsyncClient<CLIENT>;

  private args: any[];

  private callback: AsyncCreateClientCallback<CLIENT, OPTION>;

  @FixedContext
  public get() {
    return this.instance.client;
  }

  @FixedContext
  public async deploy(
    callback: AsyncCreateClientCallback<CLIENT, OPTION>,
    option: OPTION,
    ...args: any[]
  ) {
    this.args = args;
    this.callback = callback;
    this.instance = await callback(option, ...this.args);
  }

  @FixedContext
  public async redeploy(option: OPTION) {
    const newInstance = await this.callback(option, ...this.args);

    this.instance.close();
    this.instance = null;
    this.instance = newInstance;
  }

  @FixedContext
  public async close() {
    await this.instance.close();
    this.instance = null;
  }
}
