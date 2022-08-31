import { existsSync } from 'fs';

import { isValidArray, isValidDict, toConvert } from '@vodyani/utils';
import { ArgumentValidator, CustomValidated, This } from '@vodyani/class-decorator';
import { AsyncInjectable, AsyncProvider, AsyncProviderFactory } from '@vodyani/core';

import { ArkManagerOptions, RemoteConfigClient, RemoteConfigOptions } from '../common';

import { ConfigHandler } from './handler';
import { ConfigMonitor } from './monitor';
import { ConfigProvider } from './config';

@AsyncInjectable
export class ArkManager extends AsyncProvider implements AsyncProviderFactory {
  private options: ArkManagerOptions;

  @This
  @ArgumentValidator()
  public create(
    @CustomValidated(isValidDict, 'options is a required parameter!') options: ArkManagerOptions,
  ) {
    this.options = options;

    const inject: any[] = [
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
      provide: ArkManager.getToken(),
    };
  }

  @This
  private async useFactory(
    config: ConfigProvider,
    configHandler: ConfigHandler,
    configMonitor: ConfigMonitor,
    ...remoteClients: RemoteConfigClient[]
  ) {
    const { local, remote } = this.options;

    if (!local) {
      throw new Error('ArkManager: local is a required parameter!');
    }

    const { env, params, path, enableWatch, watchOptions } = local;

    if (!path) {
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

    if (remote) {
      await this.deployRemoteClient(config, remoteClients, remote);
      await this.deployRemoteClientSync(configMonitor, remoteClients, remote);
    }

    return config;
  }

  @This
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

  @This
  private async deployRemoteClient(
    config: ConfigProvider,
    remoteClients: RemoteConfigClient[],
    options: RemoteConfigOptions[],
  ) {

    await Promise.all(options.map(
      async ({ initArgs }, index) => {
        const client = remoteClients[index];
        const currentArgs = toConvert(initArgs, { default: [] });

        if (client) {
          await client.init(...currentArgs);
          const remoteConfig = await client.sync();
          config.merge(remoteConfig);
        }
      },
    ));
  }

  @This
  private async deployRemoteClientSync(
    monitor: ConfigMonitor,
    remoteClients: RemoteConfigClient[],
    options: RemoteConfigOptions[],
  ) {
    await Promise.all(options.map(
      async ({ enableCycleSync, enableSubscribe, cycleSyncInterval }, index) => {
        const client = remoteClients[index];

        if (client) {
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
