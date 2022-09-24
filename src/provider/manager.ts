import { existsSync } from 'fs';

import { ArgumentValidator, CustomValidated, This } from '@vodyani/class-decorator';
import { AsyncInjectable, AsyncProvider, AsyncProviderFactory, RemoteConfigClient } from '@vodyani/core';
import { isValidArray, isValidDict } from '@vodyani/utils';

import { ArkManagerOptions, RemoteConfigOptions } from '../common';

import { ConfigProvider } from './config';
import { ConfigHandler } from './handler';
import { ConfigMonitor } from './monitor';

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
      throw new Error('local is a required parameter!');
    }

    const { env, params, path, enableWatch, watchOptions } = local;

    if (!path) {
      throw new Error('local.path is a required parameter!');
    }

    configHandler.init({ env: env.current, ...params });

    const { defaultPath, currentPath } = this.getPath(local.path);

    configHandler.deploy(defaultPath);
    configHandler.deploy(currentPath);

    if (enableWatch) {
      configMonitor.setFileCheck(defaultPath, watchOptions);
      configMonitor.setFileCheck(currentPath, watchOptions);
    }

    if (remote) {
      await this.initRemoteClient(config, remoteClients, remote);
      await this.deployRemoteClient(configMonitor, remoteClients, remote);
    }

    return config;
  }

  @This
  private getPath(path: string) {
    const { local: { env }} = this.options;

    const defaultPath = `${path}/${env.default}.json`;
    const currentPath = `${path}/${env.current}.json`;

    if (!existsSync(defaultPath)) {
      throw new Error(`The file at ${defaultPath} does not exist!`);
    }

    if (!existsSync(currentPath)) {
      throw new Error(`The file at ${currentPath} does not exist!`);
    }

    return { currentPath, defaultPath };
  }

  @This
  private async initRemoteClient(
    config: ConfigProvider,
    clients: RemoteConfigClient[],
    options: RemoteConfigOptions[],
  ) {

    await Promise.all(
      options.map(
        async ({ args = [] }, index) => {
          const client = clients[index];

          if (client) {
            const info = await client.init(...args);
            config.merge(info);
          }
        },
      ),
    );
  }

  @This
  private async deployRemoteClient(
    monitor: ConfigMonitor,
    clients: RemoteConfigClient[],
    options: RemoteConfigOptions[],
  ) {
    await Promise.all(options.map(
      async ({ enableCycleSync, enableSubscribe, cycleSyncInterval }, index) => {
        const client = clients[index];

        if (client) {
          if (enableSubscribe) {
            monitor.autoSubscribe(client.subscribe);
          }

          if (enableCycleSync) {
            monitor.autoCycleSync(client.sync, cycleSyncInterval);
          }
        }
      },
    ));
  }
}
