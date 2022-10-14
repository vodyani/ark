import { existsSync, readFileSync } from 'fs';

import { toDeepMerge } from '@vodyani/utils';
import { IConfigLoader } from '@vodyani/core';

import { Yaml } from '../common';

export class JSONConfigLoader implements IConfigLoader {
  constructor(
    private readonly path: string,
    private readonly defaultEnv: string,
    private readonly currentEnv?: string,
  ) {}

  public execute() {
    const defaultResult = this.readJSONFile(this.defaultEnv);

    if (!this.currentEnv) {
      return defaultResult;
    }

    const currentResult = this.readJSONFile(this.currentEnv);

    return toDeepMerge(defaultResult, currentResult);
  }

  private readJSONFile(env: string) {
    const str = readFileSync(`${this.path}/${env}.json`, { encoding: 'utf8' });
    const result = JSON.parse(str);
    return result;
  }
}

export class YamlConfigLoader implements IConfigLoader {
  constructor(
    private readonly path: string,
    private readonly defaultEnv: string,
    private readonly currentEnv?: string,
  ) {}

  public execute() {
    const defaultResult = this.readYamlFile(this.defaultEnv);

    if (!this.currentEnv) {
      return defaultResult;
    }

    const currentResult = this.readYamlFile(this.currentEnv);

    return toDeepMerge(defaultResult, currentResult);
  }

  private readYamlFile(env: string) {
    let path = `${this.path}/${env}.yml`;

    if (!existsSync(path)) {
      path = `${this.path}/${env}.yaml`;
    }

    const str = readFileSync(path, { encoding: 'utf8' });
    const result = Yaml.load(str) as any;
    return result;
  }
}
