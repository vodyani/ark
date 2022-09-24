import { DynamicModule } from '@nestjs/common';
import { isValidArray, toConvert } from '@vodyani/utils';

import {
  ArkManager,
  AsyncDynamicDataSourceProvider,
  ConfigHandler,
  ConfigMonitor,
  ConfigProvider,
  DynamicDataSourceProvider,
} from './provider';
import { ArkModuleOptions } from './common';

export class ArkModule {
  static forRoot(options: ArkModuleOptions): DynamicModule {
    const imports: any[] = [];
    const manager = new ArkManager().create(options);

    const providers: any[] = [
      manager,
      ConfigMonitor,
      ConfigHandler,
      ConfigProvider,
      DynamicDataSourceProvider,
      AsyncDynamicDataSourceProvider,
    ];

    if (isValidArray(options.remote)) {
      options.remote.forEach(item => imports.push(item.import));
    }

    return {
      imports,
      providers,
      exports: providers,
      module: ArkModule,
      global: toConvert(options.global, { default: true }),
    };
  }
}
