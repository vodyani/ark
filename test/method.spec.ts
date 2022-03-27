import { describe, it, expect } from '@jest/globals';
import { toDeepMerge } from '@vodyani/core';
import { range } from 'lodash';

import { toHash, toMatchProperties, toRestoreProperties } from '../src/common/method';

describe('method', () => {
  it('test toHash', () => {
    const object = { name: test, value: { test: [1] }};
    const object2 = { name: test, value: { test: [2] }};
    const object3 = object;
    const object4 = { name: test, value: { test: [1] }};

    expect(toHash(object) === toHash(object2)).toBe(false);
    expect(toHash(object) === toHash(object3)).toBe(true);
    expect(toHash(object) === toHash(object4)).toBe(true);
  });

  it('test toMatchProperties', () => {
    const obj = {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: [1],
              },
            },
          },
        },
        c: {
          d: 2,
        },
      },
    };

    expect(toMatchProperties(obj, 'a.b.c.d.e.f', '.')).toEqual([1]);
    expect(toMatchProperties(obj, 'a.c.d')).toEqual(2);
    expect(toMatchProperties(null, null)).toBe(null);
    expect(toMatchProperties(obj, 'a:b')).toBe(null);
  });

  it('test toRestoreProperties', () => {
    expect(toRestoreProperties(1, 'a.b.c.d.e.f.g.l')).toEqual({ 'a': { 'b': { 'c': { 'd': { 'e': { 'f': { 'g': { 'l': 1 }}}}}}}});
    expect(toDeepMerge(toRestoreProperties(1, 'a.b.c.d.e.f.g.l'), { a: { b: 2 }})).toEqual({ a: { b: 2 }});
    expect(toMatchProperties(toRestoreProperties(1, 'a.b.c.d.e.f.g.l'), 'a.b.c.d.e.f.g.l')).toBe(1);
    expect(toRestoreProperties(1, null)).toBe(null);

    const deepKey = range(10000).join('.');
    expect(toMatchProperties(toRestoreProperties(1, deepKey), deepKey)).toBe(1);
  });
});
