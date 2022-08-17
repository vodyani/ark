import { existsSync, readFileSync } from 'fs';

import { uniqueId } from 'lodash';
import { Injectable } from '@nestjs/common';
import { This } from '@vodyani/class-decorator';
import { isValid, toCycle } from '@vodyani/utils';
import { FSWatcher, watch, WatchOptions } from 'chokidar';

import { Method, toHash, WatchInfo } from '../common';

import { ConfigProvider } from './config';

@Injectable()
export class ConfigMonitor {
  private readonly configWatchers = new Map<string, WatchInfo>();

  private readonly configMergeWatchers = new Map<string, string>();

  private readonly configFileWatchers = new Map<string, FSWatcher>();

  private readonly cycleWorkers = new Map<string, { close: Function }>();

  constructor(
    private readonly config: ConfigProvider,
  ) {}

  @This
  public watchConfig(callback: Method, key: string) {
    const value = this.config.get(key);
    const hashToken = toHash(value);

    this.configWatchers.set(key, { key, value, hashToken, callback });
  }

  @This
  public watchFile(path: string, options?: WatchOptions) {
    if (!existsSync(path)) {
      throw new Error(`ConfigMonitor.watchFile: The file at ${path} does not exist!`);
    }

    const watcher = watch(path, options);

    this.configFileWatchers.set(path, watcher);

    watcher.on('change', (path) => {
      try {
        const data = readFileSync(path, 'utf-8');
        this.autoMerge(JSON.parse(data), 'ConfigMonitor.watchFile');
      } catch (error) {
        //
      }
    });
  }

  @This
  public autoCycleSync(
    callback: any,
    interval = 1000,
  ) {
    const remoteClientUniqueId = uniqueId('ConfigMonitor.autoCycleSync');

    const worker = toCycle(async () => {
      const config = await callback();
      this.autoMerge(config, remoteClientUniqueId);
    }, { interval });

    this.cycleWorkers.set(remoteClientUniqueId, worker);
  }

  @This
  public async autoSubscribe(
    callback: (callback: (details: Record<string, any>) => any) => Promise<void>,
  ) {
    const remoteClientUniqueId = uniqueId('ConfigMonitor.autoSubscribe');
    await callback(async (config) => this.autoMerge(config, remoteClientUniqueId));
  }

  @This
  public autoMerge(value: any, token: string) {
    if (!isValid(value)) {
      return;
    }
    const record = this.configMergeWatchers.get(token);
    const current = toHash(value);

    if (record !== current) {
      this.config.merge(value);
      this.configMergeWatchers.set(token, current);
      this.check();
    }
  }

  @This
  public check() {
    this.configWatchers.forEach(async (details) => {
      const { key, callback, hashToken } = details;
      const currentConfig = this.config.get(key);
      const currentHashToken = toHash(currentConfig);

      if (hashToken !== currentHashToken) {
        callback(currentConfig);
        details.value = currentConfig;
        details.hashToken = currentHashToken;
      }

      this.configWatchers.set(key, details);
    });
  }

  @This
  public clearConfigWatcher() {
    this.configWatchers.clear();
  }

  @This
  public clearConfigMergeWatcher() {
    this.configMergeWatchers.clear();
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
    for (const watcher of this.configFileWatchers.values()) {
      await watcher.close();
    }

    this.configFileWatchers.clear();
  }
}
