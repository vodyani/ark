import { existsSync } from 'fs';

import {
  isValid,
  isValidArray,
  FixedContext,
  isValidObject,
  isValidString,
  ProviderFactory,
  getDefaultArray,
  RemoteConfigClient,
} from '@vodyani/core';

import { ArkManagerOptions, RemoteConfigOptions } from '../common';

import { ConfigProvider } from './config';
import { ConfigHandler } from './config-handler';
import { ConfigMonitor } from './config-monitor';

export class ArkManager implements ProviderFactory {
  public static token = Symbol('ArkManager');

  constructor(
    private readonly options: ArkManagerOptions,
  ) {
    if (!isValidObject(this.options)) {
      throw new Error('ArkManager.constructor: options is a required parameter!');
    }
  }

  @FixedContext
  public create() {
    const inject: any = [
      ConfigProvider,
      ConfigHandler,
      ConfigMonitor,
    ];

    if (isValidArray(this.options.remote)) {
      this.options.remote.forEach(item => inject.push(item.provider));
    }

    return {
      inject,
      useFactory: this.useFactory,
      provide: ArkManager.token,
    };
  }

  @FixedContext
  private async useFactory(
    config: ConfigProvider,
    configHandler: ConfigHandler,
    configMonitor: ConfigMonitor,
    ...remoteClients: RemoteConfigClient[]
  ) {
    const { local, remote } = this.options;

    if (!isValidObject(local)) {
      throw new Error('ArkManager: local is a required parameter!');
    }

    const { env, params, path, enableWatch, watchOptions } = local;

    if (!isValidString(path)) {
      throw new Error('ArkManager: local.path is a required parameter!');
    }

    configHandler.init({ env: env.current, ...params });

    const { defaultPath, currentPath } = this.deployLocalPath(local.path);

    configHandler.deploy(defaultPath);
    configHandler.deploy(currentPath);

    if (enableWatch) {
      configMonitor.watchFile(defaultPath, watchOptions);
      configMonitor.watchFile(currentPath, watchOptions);
    }

    if (isValidArray(remote)) {
      await this.deployRemoteClient(config, remoteClients, remote);
      await this.deployRemoteClientSync(configMonitor, remoteClients, remote);
    }

    return config;
  }

  @FixedContext
  private deployLocalPath(path: string) {
    const { local: { env }} = this.options;

    const defaultPath = `${path}/${env.default}.json`;
    const currentPath = `${path}/${env.current}.json`;

    if (!existsSync(defaultPath)) {
      throw new Error(`ArkManager.deployLocalPath: The file at ${defaultPath} does not exist!`);
    }

    if (!existsSync(currentPath)) {
      throw new Error(`ArkManager.deployLocalPath: The file at ${currentPath} does not exist!`);
    }

    return { currentPath, defaultPath };
  }

  @FixedContext
  private async deployRemoteClient(
    config: ConfigProvider,
    remoteClients: RemoteConfigClient[],
    options: RemoteConfigOptions[],
  ) {

    await Promise.all(options.map(
      async ({ initArgs }, index) => {
        const client = remoteClients[index];

        if (isValid(client)) {
          await client.init(...getDefaultArray(initArgs));
          const remoteConfig = await client.sync();
          config.merge(remoteConfig);
        }
      },
    ));
  }

  @FixedContext
  private async deployRemoteClientSync(
    monitor: ConfigMonitor,
    remoteClients: RemoteConfigClient[],
    options: RemoteConfigOptions[],
  ) {
    await Promise.all(options.map(
      async ({ enableCycleSync, enableSubscribe, cycleSyncInterval }, index) => {
        const client = remoteClients[index];

        if (isValid(client)) {
          if (enableSubscribe) {
            await monitor.autoSubscribe(client.subscribe);
          }

          if (enableCycleSync) {
            monitor.autoCycleSync(client.sync, cycleSyncInterval);
          }
        }
      },
    ));
  }
}
