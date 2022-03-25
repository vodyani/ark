import { existsSync, readFileSync } from 'fs';

import { Injectable } from '@nestjs/common';
import { FSWatcher, watch, WatchOptions } from 'chokidar';
import { FixedContext, isValidArray, isValidObject } from '@vodyani/core';

import { ConfigProvider } from '../config';
import { WatchCallback, WatchDetails, toHash } from '../../common';

@Injectable()
export class ConfigMonitor<T = any> {
  private readonly store = new Map<string, WatchDetails>();

  private readonly mergeStore = new Map<string, string>();

  private readonly fileStore = new Map<string, FSWatcher>();

  constructor(
    private readonly config: ConfigProvider,
  ) {}

  @FixedContext
  public watch(callback: WatchCallback, key: string) {
    let value = this.config.get(key);

    if (isValidArray(value) || isValidObject(value)) {
      value = toHash(value);
    }

    this.store.set(key, { key, value, callback });
  }

  @FixedContext
  public watchFile(path: string, options?: WatchOptions) {
    if (!existsSync(path)) {
      throw new Error(`ConfigLocalMonitor.watchFile: The file at ${path} does not exist!`);
    }

    const watcher = watch(path, options);

    this.fileStore.set(path, watcher);

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
  public autoMerge(source: string, value: any) {
    if (!isValidObject(value)) {
      return;
    }

    const current = toHash(value);
    const record = this.mergeStore.get(source);

    if (record !== current) {
      this.config.merge(value);
      this.mergeStore.set(source, current);
      this.check();
    }
  }

  @FixedContext
  public check() {
    this.store.forEach(async (details) => {
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

      this.store.set(key, details);
    });
  }

  @FixedContext
  public closeWatcher<KEY extends keyof T>(key: KEY, properties?: string, rule = '.') {
    this.store.delete(`${key}${rule}${properties}`);
  }

  @FixedContext
  public async closeFileWatcher(path: string) {
    const watcher = this.fileStore.get(path);

    if (watcher) {
      await watcher.close();
      this.fileStore.delete(path);
    }
  }
}
