import { Injectable } from '@nestjs/common';
import { This } from '@vodyani/class-decorator';
import { isValidDict, toDeepMatch, toDeepMerge, toDeepSave } from '@vodyani/utils';
import { cloneDeep } from 'lodash';

import { IConfig } from '../common';

@Injectable()
export class ConfigProvider<T = any> implements IConfig<T> {
  private writeConfig: T;

  private readonlyConfig: T;

  @This
  public get<V = any>(key: string) {
    return toDeepMatch<V>(this.readonlyConfig, key);
  }

  @This
  public search<K extends keyof T>(key: K) {
    return this.readonlyConfig[key];
  }

  @This
  public replace(key: string, value: any) {
    toDeepSave(this.writeConfig, value, key);
    this.updateReadonlyConfig();
  }

  @This
  public merge(config: T) {
    if (isValidDict(config)) {
      this.writeConfig = toDeepMerge(this.writeConfig, config);
      this.updateReadonlyConfig();
    }
  }

  @This
  private updateReadonlyConfig() {
    this.readonlyConfig = cloneDeep(this.writeConfig);
    Object.freeze(this.readonlyConfig);
  }
}
