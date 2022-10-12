import { ConfigHandlerOptions, IConfig, IConfigClientSubscriber, IConfigHandler, IConfigObserver } from '../common';

abstract class ConfigHandler<T = any> implements IConfigHandler<T> {
  protected next: IConfigHandler;

  public setNext(handler: IConfigHandler) {
    this.next = handler;

    return handler;
  }

  public async execute(options: ConfigHandlerOptions<T>) {
    if (this.next) {
      await this.next.execute(options);
    }
  }
}

export class ConfigArgumentHandler<T = any> extends ConfigHandler<T> {
  constructor(
    private readonly config: IConfig<T>,
  ) {
    super();
  }

  public async execute(options: ConfigHandlerOptions<T>) {
    this.config.merge(options.args);

    await super.execute(options);
  }
}

export class ConfigClientHandler<T = any> extends ConfigHandler<T> {
  constructor(
    private readonly subscriber: IConfigClientSubscriber,
  ) {
    super();
  }

  public async execute(options: ConfigHandlerOptions<T>) {
    for (const { client, loader, enablePolling, enableSubscribe } of options.clients) {
      await client.load(loader);

      if (enablePolling) {
        await client.polling();
      }

      if (enableSubscribe) {
        await client.subscribe(this.subscriber);
      }
    }

    await super.execute(options);
  }
}

export class DynamicDataSourceConfigObserverHandler<T = any> extends ConfigHandler<T> {
  constructor(
    private readonly observer: IConfigObserver,
  ) {
    super();
  }

  public async execute(options: ConfigHandlerOptions<T>) {
    if (options.enableDynamicDataSource) {
      this.observer.polling();
    }

    await super.execute(options);
  }
}
