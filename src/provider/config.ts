import { cloneDeep, Dictionary } from 'lodash';
import { Injectable } from '@nestjs/common';
import { ArgumentValidator, CustomValidated, Required, This } from '@vodyani/class-decorator';
import { toDeepMerge, toDeepMatch, toDeepRestore, isValidObject, isKeyof } from '@vodyani/utils';

@Injectable()
export class ConfigProvider<T = any> {
  /**
   * The configuration details store.
   */
  private store: Dictionary<T> = Object();

  /**
   * Get the configuration for the given key.
   *
   * @publicApi
   */
  @This
  @ArgumentValidator()
  public match(
    @Required() key: string,
  ) {
    const result = toDeepMatch(this.store, key);
    return isValidObject(result) ? cloneDeep(result) as any : result;
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
  public get<K extends keyof Dictionary<T>>(
    @Required() key: K,
  ) {
    if (isKeyof(this.store, key as string | number)) {
      const result = this.store[key];

      return isValidObject(result) ? cloneDeep(result) : result;
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
  ): void {
    const result = toDeepRestore(value, key);
    this.merge(result);
  }
  /**
   * merge the configuration
   */
  @This
  @ArgumentValidator()
  public merge(
    @CustomValidated(isValidObject, 'value must be object !') value: object,
  ): void {
    this.store = toDeepMerge(this.store, cloneDeep(value));
  }
}
