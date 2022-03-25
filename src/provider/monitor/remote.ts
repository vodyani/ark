import { uniqueId } from 'lodash';
import { FactoryProvider } from '@nestjs/common';
import { FixedContext, isValidArray, makeCycleTask } from '@vodyani/core';

import { RemoteConfigClientOptions } from '../../common';

import { ConfigMonitor } from './base';

export class ConfigRemoteMonitor {
  public static token = Symbol('ConfigRemoteMonitor');

  private provider: FactoryProvider;

  constructor(
    private readonly options: RemoteConfigClientOptions[],
  ) {
    if (!isValidArray(options)) {
      throw new Error('ConfigRemoteMonitor.constructor: options is a required parameter!');
    }

    this.provider = {
      inject: [ConfigMonitor],
      useFactory: this.useFactory,
      provide: ConfigRemoteMonitor.token,
    };
  }

  @FixedContext
  public getFactoryProvider() {
    return this.provider;
  }

  @FixedContext
  private async useFactory(monitor: ConfigMonitor) {
    const closerList: Array<() => void> = [];

    await Promise.all(this.options.map(
      async ({ interval, remoteClient, enableSubscribe, enableCycleSync }) => {
        if (enableSubscribe) {
          const remoteClientUniqueId = uniqueId('ConfigRemoteMonitor.subscribe');

          await remoteClient.subscribe(
            async (config) => monitor.autoMerge(remoteClientUniqueId, config),
          );
        }

        if (enableCycleSync) {
          const { close } = makeCycleTask(interval, async () => {
            const config = await remoteClient.getAll();

            const remoteClientUniqueId = uniqueId('ConfigRemoteMonitor.getAll');

            monitor.autoMerge(remoteClientUniqueId, config);
          });

          closerList.push(close);
        }
      },
    ));

    return closerList;
  }
}
