import { IConfigClient, IConfigClientSubscriber, IConfigLoader } from '@vodyani/core';

export class LocalConfigClient implements IConfigClient {
  private subscriber: IConfigClientSubscriber;

  public init<T = any>(loader: IConfigLoader) {
    const result = loader.execute<T>();
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
