/* eslint-disable @typescript-eslint/ban-ts-comment */
import { resolve } from 'path';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';

import { describe, it, expect } from '@jest/globals';
import { ENV, toDelay } from '@vodyani/core';

import { ConfigProvider } from '../src/provider/config';
import { ConfigHandler } from '../src/provider/config-handler';
import { ConfigMonitor } from '../src/provider/config-monitor';

const configProvider = new ConfigProvider();
const handler = new ConfigHandler(configProvider);
const monitor = new ConfigMonitor(configProvider);

describe('ConfigMonitor', () => {
  it('watchConfig', async () => {
    handler.init({ test: { test: 1 }, array: [1] });

    monitor.watchConfig(
      (config: number[]) => {
        expect(config).toBe([2]);
      },
      'array',
    );

    monitor.autoMerge(
      'array',
      [2],
    );

    const testList: any[] = [];

    monitor.watchConfig(
      (config: any) => {
        testList.push(config);
      },
      'test',
    );

    monitor.autoMerge(
      'test',
      { test: 'test' },
    );

    monitor.autoMerge(
      'test',
      null,
    );

    expect(testList[0]).toBe('test');

    monitor.autoMerge(
      'test',
      { test: 1 },
    );

    expect(testList[1]).toBe(1);

    monitor.clearConfigWatcher();
  });

  it('watchFile', async () => {
    handler.init({ env: ENV.LOCAL });

    try {
      monitor.watchFile('./undefined.json');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    const tempPath = resolve(__dirname, '../temp');
    const tempConfig = resolve(tempPath, 'config.json');
    const tempErrorConfig = resolve(tempPath, 'error.json');

    if (!existsSync(tempPath)) {
      mkdirSync(tempPath);
    }

    writeFileSync(tempConfig, JSON.stringify({ env: ENV.DEFAULT }));
    writeFileSync(tempErrorConfig, JSON.stringify({ env: ENV.DEFAULT }));

    monitor.watchFile(tempErrorConfig);
    monitor.watchFile(tempConfig);

    // @ts-ignore
    // const watcher = monitor.configFileWatchers.get(tempConfig);
    // @ts-ignore
    // const errorConfigWatcher = monitor.configFileWatchers.get(tempErrorConfig);

    await toDelay(300);

    writeFileSync(tempConfig, JSON.stringify({ env: ENV.PRO }));

    await toDelay(300);

    writeFileSync(tempErrorConfig, '10}');

    await toDelay(300);

    expect(configProvider.get('env')).toBe(ENV.PRO);

    monitor.clearConfigFileWatcher();
    monitor.clearConfigMergeWatcher();

    rmSync(tempPath, { recursive: true });
  }, 10000);

  it('autoCycleSync', async () => {
    handler.init({ autoCycleSync: 1 });

    const cb = async () => { return { autoCycleSync: 2 } };

    monitor.autoCycleSync(cb, 10);

    await toDelay(250);

    monitor.autoCycleSync(cb);

    await monitor.clearCycleSyncWorker();

    expect(configProvider.get('autoCycleSync')).toBe(2);
  });
});
