/* eslint-disable @typescript-eslint/ban-ts-comment */
import { This } from '@vodyani/class-decorator';
import { describe, it, expect } from '@jest/globals';
import { Client, ClientAdapter } from '@vodyani/core';

import { ConfigProvider } from '../src/provider/config';
import { ConfigMonitor } from '../src/provider/monitor';
import { DynamicDataSourceProvider } from '../src/provider/dynamic-data-source';

interface Demo {
  getArgs: () => any[],
  getCount: () => number,
}

class DemoClient implements Client<Demo> {
  private instance: Demo = Object();

  constructor(
    private readonly count: number,
    private readonly args: any[],
  ) {
    this.instance = {
      getArgs: () => this.args,
      getCount: () => this.count,
    };
  }

  getInstance = () => this.instance;
  close = () => { this.instance = Object() };
}

class ClientManager implements ClientAdapter<Demo> {
  private client: DemoClient;

  @This
  public getInstance() {
    return this.client.getInstance();
  }

  @This
  public getClient() {
    return this.client;
  }

  @This
  public create(count: number, ...args: any[]) {
    this.client = new DemoClient(count, args);
    return this.client;
  }
}

const config = new ConfigProvider();
const monitor = new ConfigMonitor(config);
const provider = new DynamicDataSourceProvider<Demo, number>(config, monitor);

describe('DynamicDataSourceProvider', () => {
  it('test create error', () => {
    try {
      provider.deploy(
        null as any,
        'DynamicDataSourceProvider',
        1, 2, 3,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    try {
      provider.deploy(
        new ClientManager().create,
        null as any,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('test all', async () => {
    config.set('DynamicDataSourceProvider', 1);
    config.set('DynamicDataSourceProvider_temp', 1);
    const manager = new ClientManager();
    const key_01 = 'DynamicDataSourceProvider';
    const key_02 = 'DynamicDataSourceProvider_temp';

    await Promise.all([
      provider.deploy(manager.create, key_01, 1, 2, 3),
      provider.deploy(manager.create, key_01, 4, 5, 6),
      provider.deploy(manager.create, key_02, 1, 1, 1),
    ]);

    expect(provider.getInstance(key_01).getCount()).toBe(1);
    expect(provider.getInstance(key_01).getArgs()).toEqual([4, 5, 6]);

    expect(provider.getInstance(key_02).getCount()).toBe(1);
    expect(provider.getInstance(key_02).getArgs()).toEqual([1, 1, 1]);

    monitor.autoMerge({ DynamicDataSourceProvider: 2 }, 'merge');
    expect(provider.getInstance(key_01).getCount()).toBe(2);

    expect(provider.getClient('???')).toBe(null);
    expect(provider.getInstance('???')).toBe(null);

    provider.getClient(key_01).close();
    provider.clear(key_01);
    provider.clear(key_02);
  });
});
