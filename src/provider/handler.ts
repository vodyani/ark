import { readFileSync } from 'fs';

import { Injectable } from '@nestjs/common';
import { isValidDict } from '@vodyani/utils';
import { This } from '@vodyani/class-decorator';

import { ConfigProvider } from './config';

@Injectable()
export class ConfigHandler {
  constructor(
    private readonly config: ConfigProvider,
  ) {}

  @This
  public init(details: Record<string, any>) {
    if (isValidDict(details)) {
      this.config.merge(details);
    }
  }

  @This
  public deploy(path: string) {
    try {
      const config = JSON.parse(readFileSync(path, 'utf8'));

      if (isValidDict(config)) {
        this.config.merge(config);
      }
    } catch (err) {
      throw new Error(`ConfigHandler.deploy: reading ${path} fail from disk: ${err}`);
    }
  }
}
