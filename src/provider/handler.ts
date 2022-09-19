import { readFileSync } from 'fs';

import { Injectable } from '@vodyani/core';
import { isValidObject } from '@vodyani/utils';
import { ArgumentValidator, Required, This } from '@vodyani/class-decorator';

import { ConfigProvider } from './config';

@Injectable()
export class ConfigHandler {
  constructor(
    private readonly config: ConfigProvider,
  ) {}

  @This
  @ArgumentValidator()
  public init<V = any>(params: Partial<V>): void {
    this.config.merge(params);
  }

  @This
  @ArgumentValidator()
  public deploy(@Required() path: string) {
    try {
      const config = JSON.parse(readFileSync(path, 'utf8'));

      if (isValidObject(config)) {
        this.config.merge(config);
      }
    } catch (err) {
      throw new Error(`reading ${path} fail from disk: ${err}`);
    }
  }
}
