import { FixedContext, isValidArray, makeCycleTask } from '@vodyani/core';
import { FactoryProvider } from '@nestjs/common';

import { ConfigLoader } from '../config-loader';
import { ConfigRemoteClientOptions } from '../../common';

export class ConfigRemoteMonitor {
  public static token = Symbol('ConfigRemoteMonitor');

  private provider: FactoryProvider;

  constructor(
    private readonly options: ConfigRemoteClientOptions[],
  ) {
    if (!isValidArray(options)) {
      throw new Error('ConfigRemoteMonitor.constructor: options is a required parameter!');
    }

    this.provider = {
      inject: [ConfigLoader],
      useFactory: this.useFactory,
      provide: ConfigRemoteMonitor.token,
    };
  }

  @FixedContext
  public getFactoryProvider() {
    return this.provider;
  }

  @FixedContext
  private async useFactory(loader: ConfigLoader) {
    const closerList: Array<() => void> = [];

    await Promise.all(this.options.map(
      async ({ interval, remoteClient, enableSubscribe, enableCycleSync }) => {
        if (enableSubscribe) {
          await remoteClient.subscribe(loader.merge);
        }

        if (enableCycleSync) {
          const { close } = makeCycleTask(interval, async () => {
            const details = await remoteClient.getAll();
            loader.merge(details);
          });

          closerList.push(close);
        }
      },
    ));

    return closerList;
  }
}
