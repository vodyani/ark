import { Injectable } from '@nestjs/common';
import { FixedContext, isValidObject } from '@vodyani/core';

import { ConfigProvider } from './config';

@Injectable()
export class ConfigLoader {
  constructor(private readonly config: ConfigProvider) {}

  @FixedContext
  public merge(details: Record<string, any>) {
    if (isValidObject(details)) {
      throw new Error(`ConfigLoader.merge: ${details} must be an valid objects!`);
    }

    Object.keys(details).forEach(key => {
      this.config.set(key, details[key]);
    });
  }
}
