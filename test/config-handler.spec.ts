import { resolve } from 'path';

import { describe, it, expect } from '@jest/globals';

import { ConfigProvider } from '../src/provider/config';
import { ConfigHandler } from '../src/provider/handler';

const configProvider = new ConfigProvider();
const handler = new ConfigHandler(configProvider);

const env = 'LOCAL';
const defaultEnv = 'DEFAULT';

describe('ConfigHandler', () => {
  it('init', async () => {
    handler.init({ env, defaultEnv, name: 'test' });

    expect(configProvider.match('env')).toBe(env);
    expect(configProvider.match('name')).toBe('test');
    expect(configProvider.match('defaultEnv')).toBe(defaultEnv);
  });

  it('deploy config json', () => {
    handler.deploy(resolve(__dirname, './env/DEFAULT.json'));

    expect(configProvider.match('array')).toEqual([1, 2, 3, 4, 5]);

    expect(configProvider.match('development.name')).toBe(defaultEnv);
    expect(configProvider.match('development.port')).toBe('8080');

    expect(configProvider.match('test.name')).toBe(defaultEnv);
    expect(configProvider.match('test.port')).toBe('8080');

    handler.deploy(resolve(__dirname, `./env/${env}.json`));

    expect(configProvider.match('array')).toEqual([1, 2, 3, 4, 5, 1]);

    expect(configProvider.match('development.name')).toBe(defaultEnv);
    expect(configProvider.match('development.port')).toBe('8080');

    expect(configProvider.match('test.name')).toBe(env);
    expect(configProvider.match('test.type')).toBe('test');
    expect(configProvider.match('test.port')).toBe('8080');
  });

  it('deploy error config json', () => {
    try {
      handler.deploy(resolve(__dirname, './env/undefine.json'));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
