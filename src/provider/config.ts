import { Injectable } from '@vodyani/core';
import { cloneDeep, isObject } from 'lodash';
import { ArgumentValidator, CustomValidated, Required, This } from '@vodyani/class-decorator';
import { toDeepMerge, toDeepMatch, toDeepRestore, isValidObject, isKeyof } from '@vodyani/utils';

@Injectable()
export class ConfigProvider<T = any> {
  /**
   * The configuration details store.
   */
  private store: Partial<T> = Object();

  /**
   * Deep query the configuration for the given key.
   *
   * @publicApi
   */
  @This
  @ArgumentValidator()
  public match(@Required() key: string) {
    const result = toDeepMatch(this.store, key);
    return isObject(result) ? cloneDeep(result) as any : result;
  }
  /**
   * Get the configuration for the given key.
   *
   * @tips Only the specified key can be queried, deep query is not supported.
   *
   * @publicApi
   */
  @This
  @ArgumentValidator()
  public get<K extends keyof Partial<T>>(@Required() key: K) {
    if (isKeyof(this.store, key as string)) {
      const result = this.store[key];
      return isObject(result) ? cloneDeep(result) : result;
    }
  }
  /**
   * set the configuration for the given key.
   */
  @This
  @ArgumentValidator()
  public set(
    @Required() key: string,
    @Required() value: any,
  ) {
    const result = toDeepRestore(value, key);
    this.merge(result);
  }
  /**
   * merge the configuration
   */
  @This
  @ArgumentValidator()
  public merge<T = any>(
    @CustomValidated(isValidObject, 'value must be object !') value: Partial<T>,
  ) {
    this.store = toDeepMerge(this.store, cloneDeep(value));
  }
}

