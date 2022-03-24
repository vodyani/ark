import { Injectable } from '@nestjs/common';
import { cloneDeep } from 'lodash';
import { FixedContext, isValidObject, isValidString } from '@vodyani/core';

import { toMatchProperties } from '../common';

/**
 * Configuration Accessor
 */
@Injectable()
export class ConfigProvider<T = any> {
  /**
   * The configuration details store.
   */
  private readonly store = Object();
  /**
   * get the configuration details for the given key.
   */
  @FixedContext
  public get<KEY extends keyof T>(key: KEY, properties?: string, rule = '.') {
    const value = this.store[key];

    if (isValidObject(value)) {
      const result: any = isValidString(properties)
        ? toMatchProperties(value, properties, rule)
        : value;

      // Avoid property contamination
      return isValidObject(result) ? cloneDeep(result) : result;
    }

    return value;
  }
  /**
   * set the configuration details for the given key.
   */
  @FixedContext
  public set<KEY extends keyof T>(key: KEY, value: T): void {
    // Avoid property contamination
    this.store[key] = isValidObject(value) ? cloneDeep(value) : value;
  }
}
