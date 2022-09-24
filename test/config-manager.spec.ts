/* eslint-disable @typescript-eslint/ban-ts-comment */
import { resolve } from 'path';

import { sleep } from '@vodyani/utils';
import { This } from '@vodyani/class-decorator';
import { describe, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RemoteConfigClient } from '@vodyani/core';
import { Injectable, Module } from '@nestjs/common';

import { ArkModule } from '../src/module';
import { ConfigProvider } from '../src/provider/config';
import { ArkManager, ConfigMonitor } from '../src/provider';

@Injectable()
class RemoteClient1 implements RemoteConfigClient {
  @This
  async init() {
    return this.sync();
  }

  @This
  async sync() {
    return { name1: 'RemoteClient1' };
  }

  @This
  subscribe(cb: (value: any) => any) {
    return cb({ name1: 'RemoteClient1' });
  }
}

@Module({
  exports: [RemoteClient1],
  providers: [RemoteClient1],
})
class RemoteModule1 {}

@Injectable()
class RemoteClient2 implements RemoteConfigClient {
  @This
  async init() {
    return this.sync();
  }

  @This
  async sync() {
    return { name2: 'RemoteClient2' };
  }

  @This
  subscribe(cb: (value: any) => any) {
    return cb({ name2: 'RemoteClient2' });
  }
}

@Module({
  exports: [RemoteClient2],
  providers: [RemoteClient2],
})
class RemoteModule2 {}

let config: ConfigProvider = Object();

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
            import: RemoteModule1,
            provider: RemoteClient1,
            args: [],
            enableCycleSync: true,
            cycleSyncInterval: 100,
          },
          {
            import: RemoteModule2,
            provider: RemoteClient2,
            args: [],
            enableSubscribe: true,
          },
        ],
      })],
    }).compile();

    config = moduleRef.get<ConfigProvider>(ArkManager.getToken());

    await sleep(1000);

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
        imports: [ArkModule.forRoot(null as any)],
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
