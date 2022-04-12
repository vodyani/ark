import { describe, it, expect } from '@jest/globals';

import { ConfigProvider } from '../src/provider/config';

const configProvider = new ConfigProvider();

describe('ConfigProvider', () => {
  it('set & get', async () => {
    configProvider.set('test', 'test');
    expect(configProvider.get('test')).toBe('test');
    expect(configProvider.discovery('test')).toBe('test');

    configProvider.set('test1', { name: 'test1' });
    expect(configProvider.get('test1')).toEqual({ name: 'test1' });
    expect(configProvider.discovery('test1')).toEqual({ name: 'test1' });

    configProvider.set('test', ['test2']);
    expect(configProvider.get('test')).toEqual(['test2']);
    expect(configProvider.discovery('test')).toEqual(['test2']);

    configProvider.set('test.name', 'test');
    expect(configProvider.get('test.name')).toBe('test');

    configProvider.set('a.b.c.d.e.f.g.h', 'test');
    expect(configProvider.get('a.b.c.d.e.f.g.h')).toBe('test');
  });

  it('set & merge', () => {
    configProvider.set('merge', { 1: [1, 2, 3], 2: '2' });
    configProvider.merge({ merge: { '1': [1, 2, 4], '2': 2 }});
    expect(configProvider.get('merge')).toEqual({ 1: [1, 2, 4], 2: 2 });
  });

  it('discovery', () => {
    interface Config {
      name: string;
      age?: number;
    }

    interface Config1 {
      details?: Record<string, any>;
    }

    type BASE = Config & Config1;

    const configProvider = new ConfigProvider<BASE>();

    configProvider.set('name', 'test');

    expect(configProvider.discovery<'name'>('name')).toEqual('test');
  });
});
