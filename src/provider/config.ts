import { Injectable } from '@nestjs/common';
import { isValidDict, toDeepMatch, toDeepMerge, toDeepRestore } from '@vodyani/utils';

import { IConfig } from '../common';

@Injectable()
export class ConfigProvider<T = any> implements IConfig<T> {
  private writeConfig: T;

  private readonlyConfig: T;

  public get<V = any>(key: string) {
    return toDeepMatch<V>(this.readonlyConfig, key);
  }

  public search<K extends keyof T>(key: K) {
    return this.readonlyConfig[key];
  }

  public set(key: string, value: any) {
    this.merge(toDeepRestore<T>(value, key));
  }

  public merge(config: T) {
    if (isValidDict(config)) {
      this.writeConfig = toDeepMerge(this.writeConfig, config);

      this.readonlyConfig = this.writeConfig;

      Object.freeze(this.readonlyConfig);
    }
  }
}
