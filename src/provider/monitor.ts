import { readFileSync } from 'fs';

import { uniqueId } from 'lodash';
import { This } from '@vodyani/class-decorator';
import { isValid, circular } from '@vodyani/utils';
import { FSWatcher, watch, WatchOptions } from 'chokidar';
import { Injectable, RemoteConfigClient } from '@vodyani/core';

import { toHash, WatchInfo } from '../common';

import { ConfigProvider } from './config';

@Injectable()
export class ConfigMonitor {
  private readonly mergeWatchers = new Map<string, string>();
  private readonly fileWatchers = new Map<string, FSWatcher>();
  private readonly configWatchers = new Map<string, WatchInfo>();
  private readonly cycleWorkers = new Map<string, { close: Function }>();

  constructor(
    private readonly config: ConfigProvider,
  ) {}

  @This
  public async autoSubscribe(subscribe: RemoteConfigClient['subscribe']) {
    const token = uniqueId('ConfigMonitor.autoSubscribe');
    await subscribe((config: any) => this.autoMerge(config, token));
  }

  @This
  public autoCycleSync(sync: RemoteConfigClient['sync'], interval = 1000) {
    const token = uniqueId('ConfigMonitor.autoCycleSync');
    const worker = circular(
      async () => {
        this.autoMerge(await sync(), token);
      },
      interval,
    );

    this.cycleWorkers.set(token, worker);
  }

  @This
  public autoMerge(value: any, token: string) {
    if (isValid(value)) {
      const current = toHash(value);
      const record = this.mergeWatchers.get(token);

      // check merge
      if (record !== current) {
        this.config.merge(value);
        this.mergeWatchers.set(token, current);
        this.mergeCheck();
      }
    }
  }

  @This
  public mergeCheck() {
    this.configWatchers.forEach(async e => {
      const { key, callback, hashToken } = e;
      const currentConfig = this.config.match(key);
      const currentHashToken = toHash(currentConfig);

      if (hashToken !== currentHashToken) {
        callback(currentConfig);
        e.value = currentConfig;
        e.hashToken = currentHashToken;
      }

      this.configWatchers.set(key, e);
    });
  }

  @This
  public setCheck(callback: (config: Partial<any>) => any, key: string) {
    const value = this.config.match(key);
    this.configWatchers.set(
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
  public setFileCheck(path: string, options?: WatchOptions) {
    const watcher = watch(path, options);
    const token = uniqueId('ConfigMonitor.watchFile');

    this.fileWatchers.set(path, watcher);

    watcher.on('change', path => {
      try {
        const config = JSON.parse(readFileSync(path, 'utf-8'));
        this.autoMerge(config, token);
      } catch (e) {}
    });
  }

  @This
  public clearConfigWatcher() {
    this.configWatchers.clear();
  }

  @This
  public clearConfigMergeWatcher() {
    this.mergeWatchers.clear();
  }

  @This
  public async clearCycleSyncWorker() {
    this.cycleWorkers.forEach((worker) => worker.close());
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
