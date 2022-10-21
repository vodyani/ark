import { Injectable } from '@nestjs/common';
import { This } from '@vodyani/class-decorator';
import { IConfigObserver, IConfigSubscriber } from '@vodyani/core';
import { CircularHandler, toHash, circular } from '@vodyani/utils';

import { ConfigProvider } from './config';

@Injectable()
export class DynamicDataSourceConfigObserver<T = any> implements IConfigObserver {
  private readonly subscribers = new Map<string, IConfigSubscriber>();

  private readonly hash = new Map<string, string>();

  private readonly keys = new Set<string>();

  private poller: CircularHandler;

  constructor(
    private readonly config: ConfigProvider<T>,
  ) {}

  @This
  public subscribe(key: string, subscriber: IConfigSubscriber) {
    const config = this.config.get(key);
    const hash = toHash(config);

    this.keys.add(key);
    this.hash.set(key, hash);
    this.subscribers.set(key, subscriber);
  }

  @This
  public notify(key: string, value: any) {
    const subscriber = this.subscribers.get(key);

    subscriber.update(key, value);
  }

  @This
  public polling() {
    this.poller = circular(this.circularContrast, 1000);
  }

  @This
  public unPolling() {
    this.poller.close();
    this.poller = null;
  }

  @This
  public unSubscribe(key: string) {
    this.subscribers.delete(key);
    this.keys.delete(key);
  }

  @This
  private circularContrast() {
    this.keys.forEach((key) => {
      const value = this.config.get(key);
      const allowNotify = this.contrast(key, value);

      if (allowNotify) {
        this.notify(key, value);
      }
    });
  }

  @This
  private contrast(key: string, value: any) {
    const afterHash = toHash(value);
    const beforeHash = this.hash.get(key);

    if (afterHash !== beforeHash) {
      this.hash.set(key, afterHash);
      return true;
    }

    return false;
  }
}
