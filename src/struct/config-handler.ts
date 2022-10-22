import { IConfig, IConfigClientSubscriber, IConfigObserver } from '@vodyani/core';

import { IConfigHandler, ConfigHandlerOptions } from '../common';

export abstract class AbstractConfigHandler<T = any> implements IConfigHandler<T> {
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

export class ConfigArgumentHandler<T = any> extends AbstractConfigHandler<T> {
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

export class ConfigClientHandler<T = any> extends AbstractConfigHandler<T> {
  constructor(
    private readonly config: IConfig<T>,
    private readonly subscriber: IConfigClientSubscriber,
  ) {
    super();
  }

  public async execute(options: ConfigHandlerOptions<T>) {
    for (const { client, loader, enablePolling, enableSubscribe } of options.clients) {
      const config = await client.init(loader);

      this.config.merge(config);

      if (enableSubscribe) {
        client.subscribe(this.subscriber);
      }

      if (enablePolling) {
        client.polling();
      }
    }

    await super.execute(options);
  }
}

export class DynamicDataSourceConfigObserverHandler<T = any> extends AbstractConfigHandler<T> {
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
