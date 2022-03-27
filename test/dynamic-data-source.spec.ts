/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, it, expect } from '@jest/globals';
import { FixedContext } from '@vodyani/core';

import { ConfigProvider } from '../src/provider/config';
import { ConfigMonitor } from '../src/provider/config-monitor';
import { DynamicDataSourceProvider } from '../src/provider/dynamic-data-source';

class Client {
  constructor(
    private readonly count: number,
    private readonly args: any[],
  ) {}

  getArgs = () => this.args;

  getCount = () => this.count;
}

class ClientManager {
  private instance: any;

  @FixedContext
  // @ts-ignore
  public create(count: number, ...args: any[]) {
    this.instance = new Client(count, args);

    return {
      client: this.instance,
      close: () => {
        this.instance = null;
      },
    };
  }
}

const config = new ConfigProvider();
const monitor = new ConfigMonitor(config);
const provider = new DynamicDataSourceProvider<Client, number>(config, monitor);

describe('DynamicDataSourceProvider', () => {
  it('test create error', () => {
    try {
      provider.create(
        null,
        [
          { configKey: 'DynamicDataSourceProvider', args: [1, 2, 3] },
          { configKey: 'DynamicDataSourceProvider', args: [4, 5, 6] },
          { configKey: 'DynamicDataSourceProvider_temp', args: [1, 1, 1] },
        ],
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    try {
      provider.create(
        new ClientManager().create,
        null,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('test all', async () => {
    config.set('DynamicDataSourceProvider', 1);
    config.set('DynamicDataSourceProvider_temp', 1);

    provider.create(
      new ClientManager().create,
      [
        { configKey: 'DynamicDataSourceProvider', args: [1, 2, 3] },
        { configKey: 'DynamicDataSourceProvider', args: [4, 5, 6] },
        { configKey: 'DynamicDataSourceProvider_temp', args: [1, 1, 1] },
      ],
    );

    expect(provider.discovery('DynamicDataSourceProvider').getCount()).toBe(1);
    expect(provider.discovery('DynamicDataSourceProvider').getArgs()).toEqual([4, 5, 6]);

    expect(provider.discovery('DynamicDataSourceProvider_temp').getCount()).toBe(1);
    expect(provider.discovery('DynamicDataSourceProvider_temp').getArgs()).toEqual([1, 1, 1]);

    monitor.autoMerge('merge', { DynamicDataSourceProvider: 2 });
    expect(provider.discovery('DynamicDataSourceProvider').getCount()).toBe(2);

    provider.close('DynamicDataSourceProvider');
    provider.close('DynamicDataSourceProvider_temp');
  });
});
