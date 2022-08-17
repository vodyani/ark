import { describe, it, expect } from '@jest/globals';

import { ConfigProvider } from '../src/provider/config';

const configProvider = new ConfigProvider();

describe('ConfigProvider', () => {
  it('set & get', async () => {
    configProvider.set('test', 'test');
    expect(configProvider.get('test')).toBe('test');
    expect(configProvider.match('test')).toBe('test');

    configProvider.set('test1', { name: 'test1' });
    expect(configProvider.get('test1')).toEqual({ name: 'test1' });
    expect(configProvider.match('test1')).toEqual({ name: 'test1' });

    configProvider.set('test', ['test2']);
    expect(configProvider.get('test')).toEqual(['test2']);
    expect(configProvider.match('test')).toEqual(['test2']);

    configProvider.set('test.name', 'test');
    expect(configProvider.match('test.name')).toBe('test');

    configProvider.set('a.b.c.d.e.f.g.h', 'test');
    expect(configProvider.match('a.b.c.d.e.f.g.h')).toBe('test');
  });

  it('set & merge', () => {
    configProvider.set('merge', { 1: [1, 2, 3], 2: '2' });
    configProvider.merge({ merge: { '1': [1, 2, 4], '2': 6 }});
    expect(configProvider.match('merge')).toEqual({ 1: [1, 2, 3, 1, 2, 4], 2: 6 });
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

    expect(configProvider.get<'name'>('name')).toEqual('test');
  });
});
