import { isValidString } from '@vodyani/utils';

import { IConfigClient, IConfigLoader, IConfigClientSubscriber, toHash } from '../common';

export abstract class AbstractConfigClient implements IConfigClient {
  private subscriber: IConfigClientSubscriber;

  private hash: string;

  public contrast(value: any) {
    if (isValidString(this.hash)) {
      const afterHash = toHash(value);
      const beforeHash = this.hash;

      if (afterHash !== beforeHash) {
        this.notify(value);
        this.hash = afterHash;
      }
    }
  }

  public init<T = any>(loader: IConfigLoader) {
    const result = loader.execute<T>();
    this.hash = toHash(result);
    return result;
  }

  public subscribe(subscriber: IConfigClientSubscriber) {
    this.subscriber = subscriber;
  }

  public notify(value: any) {
    this.subscriber.update(value);
  }

  public polling() {
    // do somethings ...
  }

  public unPolling() {
    // do somethings ...
  }

  public unSubscribe() {
    this.subscriber = null;
  }
}

export class LocalConfigClient extends AbstractConfigClient {}
