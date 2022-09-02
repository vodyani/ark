import { readFileSync } from 'fs';

import { uniqueId } from 'lodash';
import { Injectable } from '@vodyani/core';
import { This } from '@vodyani/class-decorator';
import { isValid, PromiseMethod, toCycle } from '@vodyani/utils';
import { FSWatcher, watch, WatchOptions } from 'chokidar';

import { toHash, WatchInfo } from '../common';

import { ConfigProvider } from './config';

@Injectable()
export class ConfigMonitor {
  private readonly watchers = new Map<string, WatchInfo>();
  private readonly mergeWatchers = new Map<string, string>();
  private readonly fileWatchers = new Map<string, FSWatcher>();
  private readonly cycleWorkers = new Map<string, { close: Function }>();

  constructor(
    private readonly config: ConfigProvider,
  ) {}

  @This
  public async autoSubscribe(
    key: string,
    callback: (key: string, callback: (value: any) => any) => Promise<void>,
  ) {
    await callback(key, (value: any) => this.config.set(key, value));
  }

  @This
  public autoMerge(value: any, token: string) {
    if (isValid(value)) {
      const current = toHash(value);
      const record = this.mergeWatchers.get(token);

      if (record !== current) {
        this.config.merge(value);
        this.mergeWatchers.set(token, current);
        this.check();
      }
    }
  }

  @This
  public autoCycleSync(
    callback: PromiseMethod<any>,
    interval = 1000,
  ) {
    const token = uniqueId('ConfigMonitor.autoCycleSync');

    const worker = toCycle(
      async () => {
        this.autoMerge(await callback(), token);
      },
      { interval },
    );

    this.cycleWorkers.set(token, worker);
  }

  @This
  public check() {
    this.watchers.forEach(async e => {
      const { key, callback, hashToken } = e;
      const currentConfig = this.config.get(key);
      const currentHashToken = toHash(currentConfig);

      if (hashToken !== currentHashToken) {
        callback(currentConfig);
        e.value = currentConfig;
        e.hashToken = currentHashToken;
      }

      this.watchers.set(key, e);
    });
  }

  @This
  public watchConfig(callback: (config: any) => any, key: string) {
    const value = this.config.get(key);

    this.watchers.set(
      key,
      {
        key,
        value,
        callback,
        hashToken: toHash(value),
      },
    );
  }

  @This
  public watchFile(path: string, options?: WatchOptions) {
    const watcher = watch(path, options);
    this.fileWatchers.set(path, watcher);

    watcher.on('change', (path) => {
      try {
        this.autoMerge(
          JSON.parse(readFileSync(path, 'utf-8')),
          'ConfigMonitor.watchFile',
        );
      } catch (e) {}
    });
  }

  @This
  public clearConfigWatcher() {
    this.watchers.clear();
  }

  @This
  public clearConfigMergeWatcher() {
    this.mergeWatchers.clear();
  }

  @This
  public async clearCycleSyncWorker() {
    this.cycleWorkers.forEach((worker) => {
      worker.close();
    });

    this.cycleWorkers.clear();
  }

  @This
  public async clearConfigFileWatcher() {
    for (const watcher of this.fileWatchers.values()) {
      await watcher.close();
    }

    this.fileWatchers.clear();
  }
}
