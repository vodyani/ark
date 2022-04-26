import { isArray } from 'lodash';
import { convert } from '@vodyani/transformer';
import { DynamicModule } from '@nestjs/common';

import { ArkModuleOptions } from './common';
import { ConfigProvider } from './provider/config';
import { ArkManager } from './provider/ark-manager';
import { ConfigMonitor } from './provider/config-monitor';
import { ConfigHandler } from './provider/config-handler';
import { DynamicDataSourceProvider } from './provider/dynamic-data-source';
import { AsyncDynamicDataSourceProvider } from './provider/async-dynamic-data-source';

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

    if (options.remote && isArray(options.remote)) {
      options.remote.forEach(item => imports.push(item.module));
    }

    return {
      imports,
      providers,
      exports: providers,
      module: ArkModule,
      global: convert(options.global, true),
    };
  }
}
