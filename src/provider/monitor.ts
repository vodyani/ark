import { existsSync, readFileSync } from 'fs';

import { toCycle } from '@vodyani/utils';
import { Injectable } from '@nestjs/common';
import { This } from '@vodyani/class-decorator';
import { isArray, isObject, uniqueId } from 'lodash';
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
    let value = this.config.get(key);

    if (value && (isArray(value) || isObject(value))) {
      value = toHash(value);
    }

    this.configWatchers.set(key, { key, value, callback });
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
        this.autoMerge(
          'ConfigMonitor.watchFile',
          JSON.parse(readFileSync(path, 'utf-8')),
        );
      } catch (error) {
        console.error(error);
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
      this.autoMerge(remoteClientUniqueId, config);
    }, { interval });

    this.cycleWorkers.set(remoteClientUniqueId, worker);
  }

  @This
  public async autoSubscribe(
    callback: (callback: (details: Record<string, any>) => any) => Promise<void>,
  ) {
    const remoteClientUniqueId = uniqueId('ConfigMonitor.autoSubscribe');
    await callback(async (config) => this.autoMerge(remoteClientUniqueId, config));
  }

  @This
  public autoMerge(source: string, value: any) {
    if (!value) {
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

  @This
  public check() {
    this.configWatchers.forEach(async (details) => {
      let currentConfig = null;
      const { key, value, callback } = details;

      currentConfig = this.config.get(key);

      if (currentConfig && (isArray(currentConfig) || isObject(currentConfig))) {
        currentConfig = toHash(currentConfig);
      }

      if (value !== currentConfig) {
        callback(currentConfig);
        details.value = currentConfig;
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
