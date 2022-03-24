import { isValidArray, isValidObject, isValidString } from '@vodyani/core';

export function toMatchProperties<T>(object: any, properties: string, rule = '.'): T {
  if (!isValidObject(object) && !isValidString(properties)) {
    return null;
  }

  const factors = properties.split(rule);

  if (!isValidArray(factors)) {
    return null;
  }

  let node;
  let nodeResult = null;
  let nodeDeepLevel = 0;

  const stack = [];
  stack.push(object);

  while (stack.length > 0) {
    node = stack.pop();

    if (nodeDeepLevel === factors.length) {
      nodeResult = node;
      break;
    }

    if (isValidObject(node)) {
      for (const key of Object.keys(node)) {
        if (key === factors[nodeDeepLevel]) {
          stack.push(node[key]);
          nodeDeepLevel += 1;
          continue;
        }
      }
    }
  }

  return nodeResult;
}

export function toRestoreProperties<T>(value: any, properties: string, rule = '.'): T {
  if (!isValidString(properties)) {
    return null;
  }

  const factors = properties.split(rule);

  if (!isValidArray(factors)) {
    return null;
  }

  const object = Object();

  let node = object;

  while (factors.length > 0) {
    const key = factors.shift();

    node[key] = Object();

    if (factors.length === 0) {
      node[key] = value;
    } else {
      node = node[key];
    }
  }

  return object;
}
