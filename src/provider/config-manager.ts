import { FactoryProvider } from '@nestjs/common';
import { This } from '@vodyani/class-decorator';
import { AsyncInjectable, AsyncProvider, AsyncProviderFactory } from '@vodyani/core';

import { ArkOptions } from '../common';
import { ConfigClientSubscriber } from '../struct';
import { ConfigArgumentHandler, ConfigClientHandler, DynamicDataSourceConfigObserverHandler } from '../struct/config-handler';

import { ConfigProvider } from './config';
import { DynamicDataSourceConfigObserver } from './dynamic-data-source';

@AsyncInjectable
export class ArkManager extends AsyncProvider implements AsyncProviderFactory {
  private options: ArkOptions;

  @This
  public create(options: ArkOptions): FactoryProvider {
    const inject: any[] = [ConfigProvider];
    const { enableDynamicDataSource } = options;

    if (enableDynamicDataSource) {
      inject.push(DynamicDataSourceConfigObserver);
    }

    this.options = options;

    return {
      useFactory: this.getProvider,
      provide: ArkManager.getToken(),
      inject,
    };
  }

  @This
  private async getProvider(
    config: ConfigProvider,
    observer?: DynamicDataSourceConfigObserver,
  ) {
    const handlers = [];
    const handler = new ConfigArgumentHandler(config);

    if (this.options.clients) {
      const subscriber = new ConfigClientSubscriber(config);
      const clientHandler = new ConfigClientHandler(subscriber);

      handlers.push(clientHandler);
    }

    if (this.options.enableDynamicDataSourcePolling) {
      const observerHandler = new DynamicDataSourceConfigObserverHandler(observer);

      handlers.push(observerHandler);
    }

    while (handlers.length > 0) {
      handler.setNext(handlers.shift());
    }

    await handler.execute(this.options);

    return config;
  }
}
