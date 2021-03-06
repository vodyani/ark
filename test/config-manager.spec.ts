/* eslint-disable @typescript-eslint/ban-ts-comment */
import { resolve } from 'path';

import { RemoteConfigClient, FixedContext, toDelay } from '@vodyani/core';
import { Injectable, Module } from '@nestjs/common';
import { describe, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { ArkModule } from '../src/module';
import { ConfigProvider } from '../src/provider/config';
import { ArkManager, ConfigMonitor } from '../src/provider';

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

describe('ArkModule', () => {
  it('test all', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ArkModule.forRoot({
        local: {
          env: {
            current: 'LOCAL',
            default: 'DEFAULT',
          },
          params: { test: 1 },
          path: resolve(__dirname, './env'),
          enableWatch: true,
          watchOptions: {},
        },
        remote: [
          {
            module: RemoteModule1,
            provider: RemoteClient1,
            initArgs: [],
            enableCycleSync: true,
            cycleSyncInterval: 100,
          },
          {
            module: RemoteModule2,
            provider: RemoteClient2,
            initArgs: [],
            enableSubscribe: true,
          },
        ],
      })],
    }).compile();

    config = moduleRef.get<ConfigProvider>(ArkManager.token);

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
        imports: [ArkModule.forRoot(null)],
      }).compile();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ArkModule.forRoot({ name: 1 } as any)],
      }).compile();
    } catch (error) {

      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ArkModule.forRoot({ local: { env: { default: 'DEFAULT' }}} as any)],
      }).compile();
    } catch (error) {

      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ArkModule.forRoot({ local: { env: { current: 'LOCAL', default: 'DEFAULT' }}} as any)],
      }).compile();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ArkModule.forRoot({ local: { path: '.', env: { current: 'LOCAL', default: 'DEFAULT' }}} as any)],
      }).compile();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ArkModule.forRoot({ local: { path: resolve(__dirname, './env'), env: { current: 'PRO', default: 'DEFAULT' }}} as any)],
      }).compile();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    try {
      await Test.createTestingModule({
        imports: [ArkModule.forRoot({ local: { path: resolve(__dirname, './env'), env: { current: 'LOCAL', default: 'PRO' }}} as any)],
      }).compile();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
