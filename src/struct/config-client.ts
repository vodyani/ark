import { IConfigClient, IConfigLoader, IConfigClientSubscriber, toHash } from '../common';

export abstract class ConfigClient implements IConfigClient {
  private subscriber: IConfigClientSubscriber;

  private hash: string;

  public contrast(value: any) {
    const afterHash = toHash(value);
    const beforeHash = this.hash;

    if (afterHash !== beforeHash) {
      this.notify(value);
      this.hash = afterHash;
    }
  }

  public load<T = any>(loader: IConfigLoader) {
    return loader.execute<T>();
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

export class LocalConfigClient extends ConfigClient {}
