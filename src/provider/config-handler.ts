import { readFileSync } from 'fs';

import { Injectable } from '@nestjs/common';
import { FixedContext } from '@vodyani/core';
import { isValidObject } from '@vodyani/validator';

import { ConfigProvider } from './config';

@Injectable()
export class ConfigHandler {
  constructor(
    private readonly config: ConfigProvider,
  ) {}

  @FixedContext
  public init(details: Record<string, any>) {
    if (isValidObject(details)) {
      this.config.merge(details);
    }
  }

  @FixedContext
  public deploy(path: string) {
    try {
      const config = JSON.parse(readFileSync(path, 'utf8'));

      if (isValidObject(config)) {
        this.config.merge(config);
      }
    } catch (err) {
      throw new Error(`ConfigHandler.deploy: reading ${path} fail from disk: ${err}`);
    }
  }
}
