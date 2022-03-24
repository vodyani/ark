import { existsSync, readFileSync } from 'fs';

import { Injectable } from '@nestjs/common';
import { FSWatcher, watch, WatchOptions } from 'chokidar';
import { FixedContext, isValidArray, isValidObject } from '@vodyani/core';

import { ConfigProvider } from '../config';
import { ConfigLoader } from '../config-loader';
import { MonitorDetails, toHash } from '../../common';

@Injectable()
export class ConfigMonitor<T = any> {
  private readonly store = new Map<string, MonitorDetails>();

  private readonly fileStore = new Map<string, FSWatcher>();

  constructor(
    private readonly loader: ConfigLoader,
    private readonly config: ConfigProvider,
  ) {}

  @FixedContext
  public watch<KEY extends keyof T>(callback: (value: any) => void, key: KEY, properties?: string, rule = '.') {
    let value = this.config.get(key, properties, rule);

    if (isValidArray(value) || isValidObject(value)) {
      value = toHash(value);
    }

    const details: MonitorDetails = {
      configKey: key,
      configProperties: properties,
      configPropertyRule: rule,
      configValue: value,
      callback,
    };

    this.store.set(`${key}${rule}${properties}`, details);
  }

  @FixedContext
  public watchFile(path: string, options?: WatchOptions) {
    if (!existsSync(path)) {
      throw new Error(`ConfigLocalMonitor.onWatch: The file at ${path} does not exist!`);
    }

    const watcher = watch(path, options);

    this.fileStore.set(path, watcher);

    watcher.on('change', (path) => {
      try {
        this.loader.merge(JSON.parse(readFileSync(path, 'utf-8')));
      } catch (error) {
        // Ignore error
      }
    });
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
