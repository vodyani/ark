import { readFileSync } from 'fs';

import { Injectable } from '@nestjs/common';
import { FixedContext, isValidObject } from '@vodyani/core';

import { ConfigProvider } from './config';

@Injectable()
export class ConfigHandler {
  constructor(private readonly config: ConfigProvider) {}

  @FixedContext
  public init(details: Record<string, any>) {
    if (!isValidObject(details)) {
      throw new Error('ConfigLocalHandler.deployEnv: When setting an environment variable, the property passed in must be an object!');
    }

    this.config.merge(details);
  }

  @FixedContext
  public deploy(path: string) {
    try {
      const config = JSON.parse(readFileSync(path, 'utf8'));

      if (!isValidObject(config)) {
        throw new Error('config is not valid JSON');
      }

      this.config.merge(config);
    } catch (err) {
      throw new Error(`ConfigLocalHandler.deployEnvFile: reading ${path} fail from disk: ${err}`);
    }
  }
}
