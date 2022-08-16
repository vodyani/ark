import { DynamicModule } from '@nestjs/common';
import { isValid, isValidArray } from '@vodyani/utils';

import { ArkModuleOptions } from './common';
import { ConfigProvider } from './provider/config';
import { ArkManager } from './provider/manager';
import { ConfigMonitor } from './provider/monitor';
import { ConfigHandler } from './provider/handler';
import { DynamicDataSourceProvider, AsyncDynamicDataSourceProvider } from './provider/dynamic-data-source';

export class ArkModule {
  static forRoot(options: ArkModuleOptions): DynamicModule {
    const imports: any[] = [];
    const manager = new ArkManager(options).create();

    const providers: any[] = [
      manager,
      ConfigMonitor,
      ConfigHandler,
      ConfigProvider,
      DynamicDataSourceProvider,
      AsyncDynamicDataSourceProvider,
    ];

    if (isValidArray(options.remote)) {
      options.remote.forEach(item => imports.push(item.module));
    }

    return {
      imports,
      providers,
      exports: providers,
      module: ArkModule,
      global: isValid(options.global) ? options.global : true,
    };
  }
}
