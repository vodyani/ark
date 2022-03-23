import { FixedContext } from '@vodyani/core';

import { AsyncClient } from '../interface';
import { AsyncCreateClient } from '../type';

export class AsyncClientProxy<CLIENT, OPTION> {
  private instance: AsyncClient<CLIENT>;

  private callback: AsyncCreateClient<CLIENT, OPTION>;

  @FixedContext
  public get() {
    return this.instance.client;
  }

  @FixedContext
  public async deploy(callback: AsyncCreateClient<CLIENT, OPTION>, option: OPTION) {
    this.callback = callback;
    this.instance = await callback(option);
  }

  @FixedContext
  public async redeploy(option: OPTION) {
    const newInstance = await this.callback(option);
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
