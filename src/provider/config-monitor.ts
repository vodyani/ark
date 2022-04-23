import { existsSync, readFileSync } from 'fs';

import { uniqueId } from 'lodash';
import { Injectable } from '@nestjs/common';
import { FSWatcher, watch, WatchOptions } from 'chokidar';
import { FixedContext, makeCycleTask } from '@vodyani/core';
import { isValidArray, isValidObject } from '@vodyani/validator';

import { toHash, WatchCallback, WatchDetails } from '../common';

import { ConfigProvider } from './config';

@Injectable()
export class ConfigMonitor {
  private readonly configWatchers = new Map<string, WatchDetails>();

  private readonly configMergeWatchers = new Map<string, string>();

  private readonly configFileWatchers = new Map<string, FSWatcher>();

  private readonly cycleWorkers = new Map<string, { close: Function }>();

  constructor(
    private readonly config: ConfigProvider,
  ) {}

  @FixedContext
  public watchConfig(callback: WatchCallback, key: string) {
    let value = this.config.get(key);

    if (isValidArray(value) || isValidObject(value)) {
      value = toHash(value);
    }

    this.configWatchers.set(key, { key, value, callback });
  }

  @FixedContext
  public watchFile(path: string, options?: WatchOptions) {
    if (!existsSync(path)) {
      throw new Error(`ConfigMonitor.watchFile: The file at ${path} does not exist!`);
    }

    const watcher = watch(path, options);

    this.configFileWatchers.set(path, watcher);

    watcher.on('change', (path) => {
      try {
        this.autoMerge(
          'ConfigMonitor.watchFile',
          JSON.parse(readFileSync(path, 'utf-8')),
        );
      } catch (error) {
        console.error(error);
      }
    });
  }

  @FixedContext
  public autoCycleSync(
    callback: (...args: any[]) => Promise<any>,
    interval = 1000,
  ) {
    const remoteClientUniqueId = uniqueId('ConfigMonitor.autoCycleSync');

    const worker = makeCycleTask(interval, async () => {
      const config = await callback();
      this.autoMerge(remoteClientUniqueId, config);
    });

    this.cycleWorkers.set(remoteClientUniqueId, worker);
  }

  @FixedContext
  public async autoSubscribe(
    callback: (callback: (details: Record<string, any>) => any) => Promise<void>,
  ) {
    const remoteClientUniqueId = uniqueId('ConfigMonitor.autoSubscribe');
    await callback(async (config) => this.autoMerge(remoteClientUniqueId, config));
  }

  @FixedContext
  public autoMerge(source: string, value: any) {
    if (!isValidObject(value)) {
      return;
    }

    const current = toHash(value);
    const record = this.configMergeWatchers.get(source);

    if (record !== current) {
      this.config.merge(value);
      this.configMergeWatchers.set(source, current);
      this.check();
    }
  }

  @FixedContext
  public check() {
    this.configWatchers.forEach(async (details) => {
      let currentConfig = null;
      const { key, value, callback } = details;

      currentConfig = this.config.get(key);

      if (isValidArray(currentConfig) || isValidObject(currentConfig)) {
        currentConfig = toHash(currentConfig);
      }

      if (value !== currentConfig) {
        callback(currentConfig);
        details.value = currentConfig;
      }

      this.configWatchers.set(key, details);
    });
  }

  @FixedContext
  public clearConfigWatcher() {
    this.configWatchers.clear();
  }

  @FixedContext
  public clearConfigMergeWatcher() {
    this.configMergeWatchers.clear();
  }

  @FixedContext
  public async clearCycleSyncWorker() {
    this.cycleWorkers.forEach((worker) => {
      worker.close();
    });

    this.cycleWorkers.clear();
  }

  @FixedContext
  public async clearConfigFileWatcher() {
    for (const watcher of this.configFileWatchers.values()) {
      await watcher.close();
    }

    this.configFileWatchers.clear();
  }
}
