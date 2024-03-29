import { IConfigClient, IConfigClientSubscriber, IConfigLoader } from '@vodyani/core';

export class LocalConfigClient implements IConfigClient {
  private subscriber: IConfigClientSubscriber;

  public init<T = any>(loader: IConfigLoader<T>) {
    const result = loader.execute();
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

  public polling() {
    // do something ...
  }

  public unPolling() {
    // do something ...
  }
}
