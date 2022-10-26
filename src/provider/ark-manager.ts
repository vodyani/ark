import { FactoryProvider } from '@nestjs/common';
import { This } from '@vodyani/class-decorator';
import { AsyncInjectable, AsyncProviderFactory } from '@vodyani/core';

import { ConfigHandlerOptions, IConfigHandler } from '../common';
import { ConfigClientSubscriber } from '../struct';
import { ConfigArgumentHandler, ConfigClientHandler, DynamicDataSourceConfigObserverHandler } from '../struct/config-handler';

import { ConfigProvider } from './config';
import { DynamicDataSourceConfigObserver } from './dynamic-data-source-observer';

@AsyncInjectable
export class ArkManager extends AsyncProviderFactory {
  private options: ConfigHandlerOptions;

  @This
  public create(options: ConfigHandlerOptions): FactoryProvider {
    const inject: any[] = [ConfigProvider];
    const { enableDynamicDataSource } = options;

    if (enableDynamicDataSource) {
      inject.push(DynamicDataSourceConfigObserver);
    }

    this.options = options;

    return {
      useFactory: this.useFactory,
      provide: ArkManager.getToken(),
      inject,
    };
  }

  @This
  private async useFactory(
    config: ConfigProvider,
    observer?: DynamicDataSourceConfigObserver,
  ) {
    const flow: IConfigHandler[] = [];
    const concreteHandler = new ConfigArgumentHandler(config);

    flow.push(concreteHandler);

    if (this.options.clients) {
      const handler = flow.pop();
      const subscriber = new ConfigClientSubscriber(config);
      const clientHandler = new ConfigClientHandler(config, subscriber);

      flow.push(handler.setNext(clientHandler));
    }

    if (this.options.enableDynamicDataSource) {
      const handler = flow.pop();
      const observerHandler = new DynamicDataSourceConfigObserverHandler(observer);

      flow.push(handler.setNext(observerHandler));
    }

    await concreteHandler.execute(this.options);

    return config;
  }
}
