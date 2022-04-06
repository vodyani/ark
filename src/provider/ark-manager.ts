import { existsSync } from 'fs';

import {
  isValid,
  isValidArray,
  isValidObject,
  isValidString,
  FixedContext,
  getDefaultArray,
  RemoteConfigClient,
} from '@vodyani/core';
import { Provider } from '@nestjs/common';

import { ArkManagerOptions, RemoteConfigOptions } from '../common';

import { ConfigProvider } from './config';
import { ConfigHandler } from './config-handler';
import { ConfigMonitor } from './config-monitor';

export class ArkManager {
  public static token = Symbol('ArkManager');

  private readonly provider: Provider;

  constructor(
    private readonly options: ArkManagerOptions,
  ) {
    if (!isValidObject(options)) {
      throw new Error('ArkManager.constructor: options is a required parameter!');
    }

    const inject: any = [
      ConfigProvider,
      ConfigHandler,
      ConfigMonitor,
    ];

    if (isValidArray(options.remote)) {
      options.remote.forEach(item => inject.push(item.provider));
    }

    this.provider = {
      inject,
      useFactory: this.useFactory,
      provide: ArkManager.token,
    };
  }

  @FixedContext
  public getFactoryProvider() {
    return this.provider;
  }

  @FixedContext
  private async useFactory(
    config: ConfigProvider,
    configHandler: ConfigHandler,
    configMonitor: ConfigMonitor,
    ...remoteClients: RemoteConfigClient[]
  ) {
    const { env, defaultEnv, local, remote } = this.options;

    if (!isValidString(env)) {
      throw new Error('ArkManager: env is a required parameter!');
    }

    if (!isValidString(defaultEnv)) {
      throw new Error('ArkManager: defaultEnv is a required parameter!');
    }

    if (!isValidObject(local)) {
      throw new Error('ArkManager: local is a required parameter!');
    }

    if (!isValidString(local.path)) {
      throw new Error('ArkManager: local.path is a required parameter!');
    }

    configHandler.init(local.param);

    const { defaultPath, envPath } = this.deployLocalPath(local.path);

    configHandler.deploy(defaultPath);
    configHandler.deploy(envPath);

    if (local.enableWatch) {
      configMonitor.watchFile(defaultPath, local.watchOptions);
      configMonitor.watchFile(envPath, local.watchOptions);
    }

    if (isValidArray(remote)) {
      await this.deployRemoteClient(config, remoteClients, remote);
      await this.deployRemoteClientSync(configMonitor, remoteClients, remote);
    }

    return config;
  }

  @FixedContext
  private deployLocalPath(path: string) {
    const { env, defaultEnv } = this.options;

    const envPath = `${path}/${env}.json`;
    const defaultPath = `${path}/${defaultEnv}.json`;

    if (!existsSync(envPath)) {
      throw new Error(`ArkManager.deployLocalPath: The file at ${envPath} does not exist!`);
    }

    if (!existsSync(defaultPath)) {
      throw new Error(`ArkManager.deployLocalPath: The file at ${defaultPath} does not exist!`);
    }
    return { envPath, defaultPath };
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
