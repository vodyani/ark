import { isValidArray } from '@vodyani/core';
import { DynamicModule } from '@nestjs/common';

import { ConfigModuleOptions } from './common';
import { ConfigProvider } from './provider/config';
import { ConfigMonitor } from './provider/config-monitor';
import { ConfigManager } from './provider/config-manager';
import { AsyncDynamicDataSourceProvider, ConfigHandler } from './provider';
import { DynamicDataSourceProvider } from './provider/dynamic-data-source';

export class ConfigModule {
  static forRoot(options: ConfigModuleOptions): DynamicModule {
    const imports: any[] = [];

    const providers: any[] = [
      ConfigMonitor,
      ConfigHandler,
      ConfigProvider,
      DynamicDataSourceProvider,
      AsyncDynamicDataSourceProvider,
      new ConfigManager(options).getFactoryProvider(),
    ];

    if (isValidArray(options.remote)) {
      options.remote.forEach(item => imports.push(item.module));
    }

    return {
      imports,
      providers,
      exports: providers,
      module: ConfigModule,
      global: options.global,
    };
  }
}
