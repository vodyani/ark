/* eslint-disable @typescript-eslint/ban-ts-comment */
import { toDelay } from '@vodyani/utils';
import { This } from '@vodyani/class-decorator';
import { describe, it, expect } from '@jest/globals';

import { ConfigProvider } from '../src/provider/config';
import { ConfigMonitor } from '../src/provider/monitor';
import { AsyncDynamicDataSourceProvider } from '../src/provider/dynamic-data-source';
import { AsyncClient, AsyncClientAdapter } from '../src/common';

interface Demo {
  getArgs: () => any[],
  getCount: () => number,
}

class DemoClient implements AsyncClient<Demo> {
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
  close = async () => { this.instance = Object() };
}

class ClientManager implements AsyncClientAdapter<Demo> {
  private client: DemoClient;

  @This
  // @ts-ignore
  public getClient() {
    return this.client;
  }

  @This
  // @ts-ignore
  public async create(count: number, ...args: any[]) {
    this.client = new DemoClient(count, args);
    return this.client;
  }
}

const config = new ConfigProvider();
const monitor = new ConfigMonitor(config);
const provider = new AsyncDynamicDataSourceProvider<Demo, number>(config, monitor);

describe('AsyncDynamicDataSourceProvider', () => {
  it('test create error', async () => {
    try {
      await provider.deploy(
        null as any,
        { configKey: 'AsyncDynamicDataSourceProvider', args: [1, 2, 3] },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    try {
      await provider.deploy(
        new ClientManager().create,
        null as any,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('test all', async () => {
    config.set('AsyncDynamicDataSource', 1);
    config.set('AsyncDynamicDataSource_temp', 1);

    const manager = new ClientManager();
    const key_01 = 'AsyncDynamicDataSource';
    const key_02 = 'AsyncDynamicDataSource_temp';

    await Promise.all([
      provider.deploy(manager.create, { configKey: key_01, args: [1, 2, 3] }),
      provider.deploy(manager.create, { configKey: key_01, args: [4, 5, 6] }),
      provider.deploy(manager.create, { configKey: key_02, args: [1, 1, 1] }),
    ]);

    expect(provider.getClient('???')).toBe(null);
    expect(provider.getInstance('???')).toBe(null);
    expect(provider.getInstance(key_01).getCount()).toBe(1);
    expect(provider.getInstance(key_01).getArgs()).toEqual([4, 5, 6]);

    expect(provider.getInstance(key_02).getCount()).toBe(1);
    expect(provider.getInstance(key_02).getArgs()).toEqual([1, 1, 1]);

    monitor.autoMerge({ AsyncDynamicDataSource: 2 }, 'async_merge');

    await toDelay(200);

    expect(provider.getInstance(key_01).getCount()).toBe(2);

    await provider.getClient(key_01).close();

    provider.clear(key_01);
    provider.clear(key_02);
  });
});
