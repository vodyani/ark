/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, it, expect } from '@jest/globals';
import { FixedContext, toDelay } from '@vodyani/core';

import { ConfigProvider } from '../src/provider/config';
import { ConfigMonitor } from '../src/provider/config-monitor';
import { AsyncDynamicDataSourceProvider } from '../src/provider/async-dynamic-data-source';

class ClientAdapter {
  constructor(
    private readonly count: number,
    private readonly args: any[],
  ) {}

  getArgs = () => this.args;

  getCount = () => this.count;
}

class ClientManager {
  private client: any;

  @FixedContext
  // @ts-ignore
  public async create(count: number, ...args: any[]) {
    this.client = new ClientAdapter(count, args);

    return {
      instance: this.client,
      close: async () => {
        this.client = null;
      },
    };
  }
}

const config = new ConfigProvider();
const monitor = new ConfigMonitor(config);
const provider = new AsyncDynamicDataSourceProvider<ClientAdapter, number>(config, monitor);

describe('AsyncDynamicDataSourceProvider', () => {
  it('test create error', async () => {
    try {
      await provider.create(
        null,
        [
          { configKey: 'AsyncDynamicDataSourceProvider', args: [1, 2, 3] },
        ],
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    try {
      await provider.create(
        new ClientManager().create,
        null,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('test all', async () => {
    config.set('AsyncDynamicDataSource', 1);
    config.set('AsyncDynamicDataSource_temp', 1);

    await provider.create(
      new ClientManager().create,
      [
        { configKey: 'AsyncDynamicDataSource', args: [1, 2, 3] },
        { configKey: 'AsyncDynamicDataSource', args: [4, 5, 6] },
        { configKey: 'AsyncDynamicDataSource_temp', args: [1, 1, 1] },
      ],
    );

    expect(provider.getClient('AsyncDynamicDataSource').getCount()).toBe(1);
    expect(provider.getClient('AsyncDynamicDataSource').getArgs()).toEqual([4, 5, 6]);

    expect(provider.getClient('AsyncDynamicDataSource_temp').getCount()).toBe(1);
    expect(provider.getClient('AsyncDynamicDataSource_temp').getArgs()).toEqual([1, 1, 1]);

    monitor.autoMerge('async_merge', { AsyncDynamicDataSource: 2 });

    await toDelay(200);

    expect(provider.getClient('AsyncDynamicDataSource').getCount()).toBe(2);

    await provider.get('AsyncDynamicDataSource').close();
    provider.close('AsyncDynamicDataSource');
    provider.close('AsyncDynamicDataSource_temp');
  });
});
