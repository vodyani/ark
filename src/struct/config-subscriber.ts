import { IConfigClientSubscriber, IConfig } from '@vodyani/core';

export class ConfigClientSubscriber<T = any> implements IConfigClientSubscriber {
  constructor(
    private readonly config: IConfig<T>,
  ) {}

  public update(value: any) {
    this.config.merge(value);
  }
}
