import { resolve } from 'path';

import { describe, it, expect } from '@jest/globals';

import { JSONConfigLoader, YamlConfigLoader } from '../../src';

describe('ConfigLoader', () => {
  const fileDirPath = resolve(__dirname, '../files');
  const jsonFilePath = `${fileDirPath}/json-env`;
  const yamlFilePath = `${fileDirPath}/yaml-env`;

  it('JSONConfigLoader', async () => {
    const loader = new JSONConfigLoader(jsonFilePath, 'DEFAULT', 'LOCAL');

    const config = loader.execute();

    expect(config.json.list).toEqual([1, 2]);
    expect(config.json.name).toBe('json');
    expect(config.json.age).toBe(3);

    const loader2 = new JSONConfigLoader(jsonFilePath, 'DEFAULT');
    const config2 = loader2.execute();

    expect(config2.json.list).toEqual([1]);
    expect(config2.json.name).toBe('json');
  });

  it('YamlConfigLoader', async () => {
    const loader = new YamlConfigLoader(yamlFilePath, 'DEFAULT', 'LOCAL');

    const config = loader.execute();

    expect(config.yaml.list).toEqual([1, 2]);
    expect(config.yaml.name).toBe('yaml');
    expect(config.yaml.age).toBe(3);

    const loader2 = new YamlConfigLoader(yamlFilePath, 'DEFAULT');
    const config2 = loader2.execute();

    expect(config2.yaml.list).toEqual([1]);
    expect(config2.yaml.name).toBe('yaml');
  });
});
