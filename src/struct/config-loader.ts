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
    const defaultResult = this.readJSON(this.defaultEnv);
    const currentResult = this.readJSON(this.currentEnv);
    const result = toDeepMatch(defaultResult, currentResult);
    return result;
  }

  private readJSON(env: string) {
    const str = readFileSync(`${this.path}/${env}.json`, { encoding: 'utf8' });
    const result = JSON.parse(str);
    return result;
  }
}

export class YAMLConfigLoader implements IConfigLoader {
  constructor(
    private readonly path: string,
    private readonly defaultEnv: string,
    private readonly currentEnv: string,
  ) {}

  public execute() {
    const defaultResult = this.readJSON(this.defaultEnv);
    const currentResult = this.readJSON(this.currentEnv);
    const result = toDeepMatch(defaultResult, currentResult);
    return result;
  }

  private readJSON(env: string) {
    const str = readFileSync(`${this.path}/${env}.yml`, { encoding: 'utf8' });
    const result = Yaml.load(str) as any;
    return result;
  }
}
