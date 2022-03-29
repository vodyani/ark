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
      throw new Error('ArkManager: env is a required parameter!');
    }

    if (!isValidObject(local)) {
      throw new Error('ArkManager: local is a required parameter!');
    }

    if (!isValidString(local.path)) {
      throw new Error('ArkManager: local.path is a required parameter!');
    }

    configHandler.init(local.params);

    const { defaultPath, envPath } = this.deployLocalPath(local.path, env, defaultEnv);

    configHandler.deploy(defaultPath);
    configHandler.deploy(envPath);

    if (local.enableWatch) {
      configMonitor.watchFile(defaultPath, local.watchOptions);
      configMonitor.watchFile(envPath, local.watchOptions);
    }

    if (isValidArray(remote)) {
      await this.deployRemoteClient(env, config, remoteClients, remote);
      await this.deployRemoteClientSync(configMonitor, remoteClients, remote);
    }

    return config;
  }

  @FixedContext
  private deployLocalPath(path: string, env: string, defaultEnv: string) {
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
    env: string,
    config: ConfigProvider,
    remoteClients: RemoteConfigClient[],
    options: RemoteConfigOptions[],
  ) {
    await Promise.all(options.map(
      async ({ options: { initOptions }}, index) => {
        const client = remoteClients[index];

        if (isValid(client) && isValidObject(initOptions)) {
          const { path, args } = initOptions;

          await client.init(path, env, ...getDefaultArray(args));

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
      async ({ options: { syncOptions }}, index) => {
        const client = remoteClients[index];

        if (isValid(client) && isValidObject(syncOptions)) {
          const { interval, enableSubscribe, enableCycleSync } = syncOptions;

          if (enableSubscribe) {
            await monitor.autoSubscribe(client.subscribe);
          }

          if (enableCycleSync) {
            monitor.autoCycleSync(client.sync, interval);
          }
        }
      },
    ));
  }
}
