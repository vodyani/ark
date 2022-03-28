/* eslint-disable @typescript-eslint/ban-ts-comment */
import { resolve } from 'path';

import { ENV, RemoteConfigClient, FixedContext, toDelay } from '@vodyani/core';
import { Injectable, Module } from '@nestjs/common';
import { describe, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigModule } from '../src/module';
import { ConfigProvider } from '../src/provider/config';
import { ConfigManager, ConfigMonitor } from '../src/provider';

@Injectable()
// @ts-ignore
class RemoteClient1 implements RemoteConfigClient {
  @FixedContext
  // @ts-ignore
  async init() {
    return null;
  }

  @FixedContext
  // @ts-ignore
  async sync() {
    return { name1: 'RemoteClient1' };
  }

  @FixedContext
  // @ts-ignore
  subscribe(cb) {
    return cb({ name1: 'RemoteClient1' });
  }
}

@Module({
  exports: [RemoteClient1],
  providers: [RemoteClient1],
})
// @ts-ignore
class RemoteModule1 {}

@Injectable()
// @ts-ignore
class RemoteClient2 implements RemoteConfigClient {
  @FixedContext
  // @ts-ignore
  async init() {
    return null;
  }

  @FixedContext
  // @ts-ignore
  async sync() {
    return { name2: 'RemoteClient2' };
  }

  @FixedContext
  // @ts-ignore
  subscribe(cb) {
    return cb({ name2: 'RemoteClient2' });
  }
}

@Module({
  exports: [RemoteClient2],
  providers: [RemoteClient2],
})
// @ts-ignore
class RemoteModule2 {}

let config: ConfigProvider = null;

describe('ConfigModule', () => {
  it('test all', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        env: ENV.LOCAL,
        defaultEnv: ENV.DEFAULT,
        local: {
          path: resolve(__dirname, './env'),
          params: { test: 1 },
          enableWatch: true,
          watchOptions: {},
        },
        remote: [
          {
            module: RemoteModule1,
            provider: RemoteClient1,
            options: {
              initOptions: {
                path: '',
              },
              syncOptions: {
                enableCycleSync: true,
                interval: 100,
              },
            },
          },
          {
            module: RemoteModule2,
            provider: RemoteClient2,
            options: {
              initOptions: {
                path: '',
              },
              syncOptions: {
                enableSubscribe: true,
              },
            },
          },
        ],
      })],
    }).compile();

    config = moduleRef.get<ConfigProvider>(ConfigManager.token);

    await toDelay(1000);

    expect(config.get('name1')).toBe('RemoteClient1');
    expect(config.get('name2')).toBe('RemoteClient2');

    const monitor = moduleRef.get<ConfigMonitor>(ConfigMonitor);

    monitor.clearConfigFileWatcher();
    monitor.clearConfigMergeWatcher();
    monitor.clearCycleSyncWorker();
    monitor.clearConfigWatcher();
  });

  it('error options', async () => {
    try {
      await Test.createTestingModule({
        imports: [ConfigModule.forRoot(null)],
      }).compile();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ name: 1 } as any)],
      }).compile();
    } catch (error) {

      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ env: ENV.DEFAULT } as any)],
      }).compile();
    } catch (error) {

      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ env: ENV.LOCAL, defaultEnv: ENV.DEFAULT } as any)],
      }).compile();
    } catch (error) {

      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ env: ENV.LOCAL, defaultEnv: ENV.DEFAULT, local: { test: 1 }} as any)],
      }).compile();
    } catch (error) {

      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ env: ENV.LOCAL, defaultEnv: ENV.PET, local: { path: './' }} as any)],
      }).compile();
    } catch (error) {

      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ env: ENV.LOCAL, defaultEnv: ENV.PET, local: { path: resolve(__dirname, './env') }} as any)],
      }).compile();
    } catch (error) {

      expect(error).toBeInstanceOf(Error);
    }
  });
});
