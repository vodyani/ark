/* eslint-disable @typescript-eslint/ban-ts-comment */
import { resolve } from 'path';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';

import { sleep } from '@vodyani/utils';
import { describe, it, expect } from '@jest/globals';

import { ConfigProvider } from '../src/provider/config';
import { ConfigHandler } from '../src/provider/handler';
import { ConfigMonitor } from '../src/provider/monitor';

const configProvider = new ConfigProvider();
const handler = new ConfigHandler(configProvider);
const monitor = new ConfigMonitor(configProvider);

describe('ConfigMonitor', () => {
  it('watchConfig', async () => {
    handler.init({ test: { test: 1 }, array: [1] });

    monitor.setCheck(
      (config: number[]) => {
        expect(config).toEqual([1, 2]);
      },
      'array',
    );

    monitor.autoMerge(
      { test: { test: 1 }, array: [2] },
      'autoMerge.array',
    );

    const testList: any[] = [];

    monitor.setCheck(
      (config: any) => {
        testList.push(config);
      },
      'test',
    );

    monitor.autoMerge(
      { test: 'test' },
      'autoMerge.test',
    );

    monitor.autoMerge(
      null,
      'autoMerge.test',
    );

    expect(testList[0]).toBe('test');

    monitor.autoMerge(
      { test: 1 },
      'autoMerge.test',
    );

    expect(testList[1]).toBe(1);

    monitor.clearConfigWatcher();
  });

  it('watchFile', async () => {
    handler.init({ env: 'LOCAL' });

    try {
      monitor.setFileCheck('./undefined.json');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    const tempPath = resolve(__dirname, '../temp');
    const tempConfig = resolve(tempPath, 'config.json');
    const tempErrorConfig = resolve(tempPath, 'error.json');

    if (!existsSync(tempPath)) {
      mkdirSync(tempPath);
    }

    writeFileSync(tempConfig, JSON.stringify({ env: 'DEFAULT' }));
    writeFileSync(tempErrorConfig, JSON.stringify({ env: 'DEFAULT' }));

    monitor.setFileCheck(tempErrorConfig);
    monitor.setFileCheck(tempConfig);

    await sleep(300);

    writeFileSync(tempConfig, JSON.stringify({ env: 'PRO' }));

    await sleep(300);

    writeFileSync(tempErrorConfig, '10}');

    await sleep(300);

    expect(configProvider.match('env')).toBe('PRO');

    monitor.clearConfigFileWatcher();
    monitor.clearConfigMergeWatcher();

    rmSync(tempPath, { recursive: true });
  }, 10000);

  it('autoCycleSync', async () => {
    handler.init({ autoCycleSync: 1 });

    const cb = async () => { return { autoCycleSync: 2 } };

    monitor.autoCycleSync(cb, 10);

    await sleep(250);

    monitor.autoCycleSync(cb);

    await monitor.clearCycleSyncWorker();

    expect(configProvider.match('autoCycleSync')).toBe(2);
  });
});
