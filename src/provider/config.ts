import { cloneDeep } from 'lodash';
import { Injectable } from '@nestjs/common';
import { toDeepMerge } from '@vodyani/transformer';
import { isValidArray, isValidObject } from '@vodyani/validator';
import { FixedContext, toMatchProperties, toRestoreProperties, ObjectType } from '@vodyani/core';

/**
 * Configuration Accessor
 */
@Injectable()
export class ConfigProvider<T = any> {
  /**
   * The configuration details store.
   */
  private store: ObjectType<T> = Object();
  /**
   * get the configuration for the given key.
   */
  @FixedContext
  public get(key: string) {
    const result = toMatchProperties(this.store, key);
    return isValidObject(result) || isValidArray(result) ? cloneDeep(result) as any : result;
  }
  /**
   * get the configuration for the given key.
   *
   * @usageNotes
   * - Only the specified key can be queried, deep query is not supported
   */
  @FixedContext
  public discovery<K extends keyof ObjectType<T>>(key: K): ObjectType<T>[K] {
    const result = this.store[key];
    return isValidObject(result) ? cloneDeep(result) : result;
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
