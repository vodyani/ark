import { FixedContext, getDefaultArray, isValidArray } from '@vodyani/core';
import { FactoryProvider } from '@nestjs/common';

import { ConfigLoader } from '../config-loader';
import { ConfigRemoteClientOptions } from '../../common';

export class ConfigRemoteHandler {
  public static token = Symbol('ConfigRemoteHandler');

  private provider: FactoryProvider;

  constructor(
    private readonly options: ConfigRemoteClientOptions[],
  ) {
    if (!isValidArray(options)) {
      throw new Error('ConfigRemoteHandler.constructor: options is a required parameter!');
    }

    this.provider = {
      inject: [ConfigLoader],
      useFactory: this.useFactory,
      provide: ConfigRemoteHandler.token,
    };
  }

  @FixedContext
  public getFactoryProvider() {
    return this.provider;
  }

  @FixedContext
  private async useFactory(loader: ConfigLoader) {
    await Promise.all(this.options.map(
      async ({ remoteClient, remoteArgs }) => {
        const args = getDefaultArray(remoteArgs);

        await remoteClient.init(...args);

        const details = await remoteClient.getAll();
        loader.merge(details);
      },
    ));
  }
}
