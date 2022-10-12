import { readFileSync } from 'fs';

import { toDeepMatch } from '@vodyani/utils';

import { IConfigLoader, Yaml } from '../common';

export class JSONConfigLoader implements IConfigLoader {
  constructor(
    private readonly path: string,
    private readonly defaultEnv: string,
    private readonly currentEnv: string,
  ) {}

  public execute() {
    const defaultResult = this.readJSONFile(this.defaultEnv);
    const currentResult = this.readJSONFile(this.currentEnv);
    const result = toDeepMatch(defaultResult, currentResult);
    return result;
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
    private readonly currentEnv: string,
  ) {}

  public execute() {
    const defaultResult = this.readYamlFile(this.defaultEnv);
    const currentResult = this.readYamlFile(this.currentEnv);
    const result = toDeepMatch(defaultResult, currentResult);
    return result;
  }

  private readYamlFile(env: string) {
    const str = readFileSync(`${this.path}/${env}.yml`, { encoding: 'utf8' });
    const result = Yaml.load(str) as any;
    return result;
  }
}
