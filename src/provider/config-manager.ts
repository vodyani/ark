import { existsSync } from 'fs';

import { uniqueId } from 'lodash';
import { Provider } from '@nestjs/common';
import { FixedContext, getDefaultArray, isValid, isValidArray, isValidObject, isValidString } from '@vodyani/core';

import { ConfigManagerOptions, RemoteConfigClient, RemoteConfigOptions } from '../common';

import { ConfigProvider } from './config';
import { ConfigHandler } from './config-handler';
import { ConfigMonitor } from './config-monitor';

export class ConfigManager {
  public static token = Symbol('ConfigManager');

  private readonly provider: Provider;

  constructor(
    private readonly options: ConfigManagerOptions,
  ) {
    if (!isValidObject(options)) {
      throw new Error('ConfigManager.constructor: options is a required parameter!');
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
      provide: ConfigManager.token,
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
      throw new Error('ConfigManager: env is a required parameter!');
    }

    if (!isValidString(defaultEnv)) {
      throw new Error('ConfigManager: env is a required parameter!');
    }

    if (!isValidObject(local)) {
      throw new Error('ConfigManager: local is a required parameter!');
    }

    if (!isValidString(local.path)) {
      throw new Error('ConfigManager: local.path is a required parameter!');
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
      await this.deployRemoteClient(config, remoteClients, remote);
      await this.deployRemoteClientSync(configMonitor, remoteClients, remote);
    }

    return config;
  }

  @FixedContext
  private deployLocalPath(path: string, env: string, defaultEnv: string) {
    const envPath = `${path}/${env}.json`;
    const defaultPath = `${path}/${defaultEnv}.json`;

    if (!existsSync(envPath)) {
      throw new Error(`ConfigManager.deployLocalPath: The file at ${envPath} does not exist!`);
    }

    if (!existsSync(defaultPath)) {
      throw new Error(`ConfigManager.deployLocalPath: The file at ${defaultPath} does not exist!`);
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
      async ({ options: { initOptions }}, index) => {
        const client = remoteClients[index];

        if (isValid(client) && isValidObject(initOptions)) {
          const { path, args } = initOptions;

          const initArgs = getDefaultArray(args);

          await client.init(path, ...initArgs);

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
            const remoteClientUniqueId = uniqueId('remoteClient.subscribe');

            await client.subscribe(
              async (config) => monitor.autoMerge(remoteClientUniqueId, config),
            );
          }

          if (enableCycleSync) {
            monitor.autoCycleSync(client.sync, interval);
          }
        }
      },
    ));
  }
}
