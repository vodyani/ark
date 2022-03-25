import { FixedContext, getDefaultArray, isValidArray } from '@vodyani/core';
import { FactoryProvider } from '@nestjs/common';

import { ConfigProvider } from '../config';
import { RemoteConfigClientOptions } from '../../common';

export class ConfigRemoteHandler {
  public static token = Symbol('ConfigRemoteHandler');

  private provider: FactoryProvider;

  constructor(
    private readonly options: RemoteConfigClientOptions[],
  ) {
    if (!isValidArray(options)) {
      throw new Error('ConfigRemoteHandler.constructor: options is a required parameter!');
    }

    this.provider = {
      inject: [ConfigProvider],
      useFactory: this.useFactory,
      provide: ConfigRemoteHandler.token,
    };
  }

  @FixedContext
  public getFactoryProvider() {
    return this.provider;
  }

  @FixedContext
  private async useFactory(config: ConfigProvider) {
    await Promise.all(this.options.map(
      async ({ remoteClient, remoteClientInitArgs }) => {
        const args = getDefaultArray(remoteClientInitArgs);

        await remoteClient.init(...args);

        const remoteConfig = await remoteClient.getAll();

        config.merge(remoteConfig);
      },
    ));
  }
}
