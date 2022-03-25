import { existsSync, readFileSync } from 'fs';

import { uniqueId } from 'lodash';
import { Injectable } from '@nestjs/common';
import { FSWatcher, watch, WatchOptions } from 'chokidar';
import { FixedContext, isValidArray, isValidObject, makeCycleTask } from '@vodyani/core';

import { WatchCallback, WatchDetails, toHash, RemoteConfigClientSyncCallBack } from '../common';

import { ConfigProvider } from './config';

@Injectable()
export class ConfigMonitor {
  private readonly watcherStore = new Map<string, WatchDetails>();

  private readonly mergeWatcherStore = new Map<string, string>();

  private readonly fileWatcherStore = new Map<string, FSWatcher>();

  private readonly cycleWorkerStore = new Map<string, { close: Function }>();

  constructor(
    private readonly config: ConfigProvider,
  ) {}

  @FixedContext
  public watch(callback: WatchCallback, key: string) {
    let value = this.config.get(key);

    if (isValidArray(value) || isValidObject(value)) {
      value = toHash(value);
    }

    this.watcherStore.set(key, { key, value, callback });
  }

  @FixedContext
  public watchFile(path: string, options?: WatchOptions) {
    if (!existsSync(path)) {
      throw new Error(`ConfigLocalMonitor.watchFile: The file at ${path} does not exist!`);
    }

    const watcher = watch(path, options);

    this.fileWatcherStore.set(path, watcher);

    watcher.on('change', (path) => {
      try {
        this.autoMerge(
          'ConfigMonitor.watchFile',
          JSON.parse(readFileSync(path, 'utf-8')),
        );
      } catch (error) {
        // Ignore error
      }
    });
  }

  @FixedContext
  public autoCycleSync(
    callback: RemoteConfigClientSyncCallBack,
    interval = 1000,
  ) {
    const remoteClientUniqueId = uniqueId('ConfigMonitor.autoCycleSync');

    const worker = makeCycleTask(interval, async () => {
      const config = await callback();

      this.autoMerge(remoteClientUniqueId, config);
    });

    this.cycleWorkerStore.set(remoteClientUniqueId, worker);
  }

  @FixedContext
  public autoMerge(source: string, value: any) {
    if (!isValidObject(value)) {
      return;
    }

    const current = toHash(value);
    const record = this.mergeWatcherStore.get(source);

    if (record !== current) {
      this.config.merge(value);
      this.mergeWatcherStore.set(source, current);
      this.check();
    }
  }

  @FixedContext
  public check() {
    this.watcherStore.forEach(async (details) => {
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

      this.watcherStore.set(key, details);
    });
  }

  @FixedContext
  public closeWatcher(key: string) {
    this.watcherStore.delete(key);
  }

  @FixedContext
  public closeMergeWatcher(key: string) {
    this.mergeWatcherStore.delete(key);
  }

  @FixedContext
  public async clearFileWatcher() {
    for (const watcher of this.fileWatcherStore.values()) {
      await watcher.close();
    }

    this.fileWatcherStore.clear();
  }

  public clearCycleSyncWorker() {
    this.cycleWorkerStore.forEach((worker) => {
      worker.close();
    });

    this.cycleWorkerStore.clear();
  }
}
