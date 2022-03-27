import { cloneDeep } from 'lodash';
import { Injectable } from '@nestjs/common';
import { FixedContext, isValidObject, toDeepMerge } from '@vodyani/core';

import { toMatchProperties, toRestoreProperties } from '../common';

/**
 * Configuration Accessor
 */
@Injectable()
export class ConfigProvider<T = any> {
  /**
   * The configuration details store.
   */
  private store = Object();
  /**
   * get the configuration for the given key.
   */
  @FixedContext
  public get<KEY extends keyof T>(key: string): T[KEY] {
    const result = toMatchProperties(this.store, key);
    return isValidObject(result) ? cloneDeep(result) as any : result;
  }
  /**
   * set the configuration for the given key.
   */
  @FixedContext
  public set(key: string, value: any): void {
    const result = toRestoreProperties(value, key);
    this.merge(result);
  }
  /**
   * merge the configuration
   */
  @FixedContext
  public merge(value: object): void {
    if (isValidObject(value)) {
      this.store = toDeepMerge(this.store, cloneDeep(value));
    }
  }
}
