import { existsSync, readFileSync } from 'fs';

import { Injectable } from '@nestjs/common';
import { ENV, FixedContext, isValidObject, toDeepMerge } from '@vodyani/core';

import { ConfigLoader } from '../config-loader';

@Injectable()
export class ConfigHandler {
  constructor(private readonly loader: ConfigLoader) {}

  @FixedContext
  public init(details: Record<string, any>) {
    if (!isValidObject(details)) {
      throw new Error('ConfigLocalHandler.deployEnv: When setting an environment variable, the property passed in must be an object!');
    }

    this.loader.merge(details);
  }

  @FixedContext
  public getAll(dir: string, env: string, defaultEnv = ENV.DEFAULT) {
    const envFilePath = `${dir}/${env}.json`;
    const defaultFilePath = `${dir}/${defaultEnv}.json`;

    if (!existsSync(envFilePath)) {
      throw new Error(`ConfigLocalHandler.deployEnvFile: The file at ${envFilePath} does not exist!`);
    }

    if (!existsSync(defaultFilePath)) {
      throw new Error(`ConfigLocalHandler.deployEnvFile: The file at ${defaultFilePath} does not exist!`);
    }

    let envConfig = null;
    let defaultConfig = null;

    try {
      envConfig = JSON.parse(readFileSync(envFilePath, 'utf8'));

      if (!isValidObject(envConfig)) {
        throw new Error('is not valid JSON');
      }
    } catch (err) {
      throw new Error(`ConfigLocalHandler.deployEnvFile: reading ${envFilePath} fail from disk: ${err}`);
    }

    try {
      defaultConfig = JSON.parse(readFileSync(defaultFilePath, 'utf8'));

      if (!isValidObject(defaultConfig)) {
        throw new Error('is not valid JSON');
      }
    } catch (err) {
      throw new Error(`ConfigLocalHandler.deployEnvFile: reading ${defaultFilePath} fail from disk: ${err}`);
    }

    this.loader.merge(toDeepMerge(defaultConfig, envConfig));
  }
}
