import { describe, it, expect } from '@jest/globals';

import { ConfigProvider } from '../src/provider/config';

const configProvider = new ConfigProvider();

describe('ConfigProvider', () => {
  it('set & get', async () => {
    configProvider.set('test', 'test');
    expect(configProvider.get('test')).toBe('test');

    configProvider.set('test', ['test2']);
    expect(configProvider.get('test')).toEqual(['test2']);

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
});
