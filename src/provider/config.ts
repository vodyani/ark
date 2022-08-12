import { cloneDeep } from 'lodash';
import { Injectable } from '@nestjs/common';
import { This } from '@vodyani/class-decorator';
import { toDeepMerge, toDeepMatch, toDeepRestore, isValidDict, isKeyof } from '@vodyani/utils';

import { Dictionary } from '../common';

/**
 * Configuration Accessor
 */
@Injectable()
export class ConfigProvider<T = any> {
  /**
   * The configuration details store.
   */
  private store: Dictionary<T> = Object();
  /**
   * get the configuration for the given key.
   */
  @This
  public match(key: string) {
    const result = toDeepMatch(this.store, key);
    return isValidDict(result) ? cloneDeep(result) as any : result;
  }
  /**
   * get the configuration for the given key.
   *
   * @usageNotes
   * - Only the specified key can be queried, deep query is not supported
   */
  @This
  public get<K extends keyof Dictionary<T>>(key: K) {
    let result = null;

    if (isKeyof(this.store, key as number | string)) {
      result = this.store[key];
    }

    return isValidDict(result) ? cloneDeep(result) : result;
  }
  /**
   * set the configuration for the given key.
   */
  @This
  public set(key: string, value: any): void {
    const result = toDeepRestore(value, key);
    this.merge(result);
  }
  /**
   * merge the configuration
   */
  @This
  public merge(value: object): void {
    if (isValidDict(value)) {
      this.store = toDeepMerge(this.store, cloneDeep(value));
    }
  }
}
