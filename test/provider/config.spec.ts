import { describe, it, expect } from '@jest/globals';

import { ConfigProvider } from '../../src';

describe('ConfigProvider', () => {
  const config = new ConfigProvider();

  config.merge({ name: 'config', extra: { args: [1, 2, 3, 4] }});

  it('config.search', async () => {
    expect((config as ConfigProvider<{ name: string }>).search('name')).toBe('config');
  });

  it('config.get', async () => {
    expect(config.get('extra.args')).toEqual([1, 2, 3, 4]);
  });

  it('config.replace', async () => {
    config.replace('extra.args', [1]);
    expect(config.get('extra.args')).toEqual([1]);
  });

  it('config.merge', async () => {
    config.merge({ name: 'config', age: 999, extra: { args: [2] }});
    expect(config.get('extra.args')).toEqual([1, 2]);
    expect(config.get('age')).toBe(999);
  });
});
