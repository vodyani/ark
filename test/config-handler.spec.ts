import { resolve } from 'path';

import { describe, it, expect } from '@jest/globals';
import { ENV } from '@vodyani/core';

import { ConfigProvider } from '../src/provider/config';
import { ConfigHandler } from '../src/provider/config-handler';

const configProvider = new ConfigProvider();
const handler = new ConfigHandler(configProvider);

const env = ENV.LOCAL;
const defaultEnv = ENV.DEFAULT;

describe('ConfigHandler', () => {
  it('init', async () => {
    handler.init({ env, defaultEnv, name: 'test' });

    expect(configProvider.get('env')).toBe(env);
    expect(configProvider.get('name')).toBe('test');
    expect(configProvider.get('defaultEnv')).toBe(defaultEnv);
  });

  it('deploy config json', () => {
    handler.deploy(resolve(__dirname, './env/DEFAULT.json'));

    expect(configProvider.get('array')).toEqual([1, 2, 3, 4, 5]);

    expect(configProvider.get('development.name')).toBe(defaultEnv);
    expect(configProvider.get('development.port')).toBe('8080');

    expect(configProvider.get('test.name')).toBe(defaultEnv);
    expect(configProvider.get('test.port')).toBe('8080');

    handler.deploy(resolve(__dirname, `./env/${env}.json`));

    expect(configProvider.get('array')).toEqual([1, 2, 3, 4, 5]);

    expect(configProvider.get('development.name')).toBe(defaultEnv);
    expect(configProvider.get('development.port')).toBe('8080');

    expect(configProvider.get('test.name')).toBe(env);
    expect(configProvider.get('test.type')).toBe('test');
    expect(configProvider.get('test.port')).toBe('8080');
  });

  it('deploy error config json', () => {
    try {
      handler.deploy(resolve(__dirname, './env/undefine.json'));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
