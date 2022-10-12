import { resolve } from 'path';

import { describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { sleep } from '@vodyani/utils';
import { IClientAdapter } from '@vodyani/core';

import { ArkManager, ArkModule, ArkOptions, AsyncDynamicDataSourceProvider, ConfigProvider, DynamicDataSourceConfigObserver, DynamicDataSourceProvider, JSONConfigLoader, LocalConfigClient } from '../../src';

interface File {
  env: string;
  instance?: string;
  json: {
    list: number[];
    name: string;
    age: number;
  };
}

class DemoClientAdapter implements IClientAdapter<string, string> {
  private instance: string = null;

  public close() {
    this.instance = null;
  }

  public connect() {
    return this.instance;
  }

  public create(config: string) {
    this.instance = config;
  }

  public redeploy(config: string) {
    this.instance = config;
  }
}

class DemoAsyncClientAdapter implements IClientAdapter<string, string> {
  private instance: string = null;

  public async close() {
    this.instance = null;
  }

  public connect() {
    return this.instance;
  }

  public async create(config: string) {
    this.instance = config;
  }

  public async redeploy(config: string) {
    this.instance = config;
  }
}

const options: ArkOptions = {
  args: {
    env: 'LOCAL',
    instance: 'deploy',
  },
  clients: [{
    loader: new JSONConfigLoader(resolve(__dirname, '../files/json-env'), 'DEFAULT', 'LOCAL'),
    client: new LocalConfigClient(),
  }],
  enableDynamicDataSource: true,
};

describe('test', () => {
  it('ArkModule', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [ArkModule.forRoot(options)] }).compile();

    const config = moduleRef.get<ConfigProvider<File>>(ArkManager.getToken());
    const provider = moduleRef.get<DynamicDataSourceProvider>(DynamicDataSourceProvider);
    const observer = moduleRef.get<DynamicDataSourceConfigObserver>(DynamicDataSourceConfigObserver);

    const key = 'instance';

    provider.deploy(key, new DemoClientAdapter());

    observer.subscribe(key, provider);

    expect(provider.getClient(key).connect()).toBe('deploy');

    config.replace(key, 'redeploy');

    await sleep(2000);

    expect(provider.getClient(key).connect()).toBe('redeploy');

    provider.destroy(key);

    observer.unSubscribe(key);

    observer.unPolling();
  }, 100000);

  it('Mock AsyncDynamicDataSourceProvider', async () => {
    const config = new ConfigProvider();
    const dynamicDataSource = new AsyncDynamicDataSourceProvider(config);

    config.merge({ age: 1 });

    await dynamicDataSource.deploy('age', new DemoAsyncClientAdapter());

    expect(dynamicDataSource.getClient('age').connect()).toBe(1);

    config.replace('age', 2);

    await dynamicDataSource.update('age', 2);

    expect(dynamicDataSource.getClient('age').connect()).toBe(2);

    await dynamicDataSource.destroy('age');
  });
});
