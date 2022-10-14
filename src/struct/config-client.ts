import { IConfigClient, IConfigClientSubscriber, IConfigLoader } from '@vodyani/core';
import { isValidString, toHash } from '@vodyani/utils';

export class LocalConfigClient implements IConfigClient {
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

  public unSubscribe() {
    this.subscriber = null;
  }
}
