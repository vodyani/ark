import { isValidArray } from '@vodyani/core';
import { DynamicModule } from '@nestjs/common';

import { ArkModuleOptions } from './common';
import { ConfigProvider } from './provider/config';
import { ConfigMonitor } from './provider/config-monitor';
import { ArkManager } from './provider/config-manager';
import { ConfigHandler } from './provider/config-handler';
import { DynamicDataSourceProvider } from './provider/dynamic-data-source';
import { AsyncDynamicDataSourceProvider } from './provider/async-dynamic-data-source';

export class ArkModule {
  static forRoot(options: ArkModuleOptions): DynamicModule {
    const imports: any[] = [];

    const providers: any[] = [
      ConfigMonitor,
      ConfigHandler,
      ConfigProvider,
      DynamicDataSourceProvider,
      AsyncDynamicDataSourceProvider,
      new ArkManager(options).getFactoryProvider(),
    ];

    if (isValidArray(options.remote)) {
      options.remote.forEach(item => imports.push(item.module));
    }

    return {
      imports,
      providers,
      exports: providers,
      module: ArkModule,
      global: options.global,
    };
  }
}
