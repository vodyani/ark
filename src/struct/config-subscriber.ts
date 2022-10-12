import { IConfig, IConfigClientSubscriber } from '../common';

export class ConfigClientSubscriber<T = any> implements IConfigClientSubscriber {
  constructor(
    private readonly config: IConfig<T>,
  ) {}

  public update(value: any) {
    this.config.merge(value);
  }
}
