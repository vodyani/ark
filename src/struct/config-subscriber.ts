import { IConfig, IConfigClientSubscriber } from '../common';

export class ConfigClientSubscriber implements IConfigClientSubscriber {
  constructor(
    private readonly config: IConfig,
  ) {}

  public update(value: any) {
    this.config.merge(value);
  }
}
