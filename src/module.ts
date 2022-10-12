import { DynamicModule } from '@nestjs/common';
import { toConvert } from '@vodyani/utils';

import { ArkOptions } from './common';
import {
  ArkManager, AsyncDynamicDataSourceProvider,
  ConfigProvider, DynamicDataSourceConfigObserver, DynamicDataSourceProvider,
} from './provider';

export class ArkModule {
  static forRoot(options: ArkOptions): DynamicModule {
    const manager = new ArkManager().create(options);

    const providers: any[] = [ConfigProvider, manager];
    const { enableDynamicDataSource, global, imports } = options;

    if (enableDynamicDataSource) {
      providers.push(AsyncDynamicDataSourceProvider);
      providers.push(DynamicDataSourceProvider);
      providers.push(DynamicDataSourceConfigObserver);
    }

    return {
      imports,
      providers,
      module: ArkModule,
      exports: providers,
      global: toConvert(global, { default: true }),
    };
  }
}
