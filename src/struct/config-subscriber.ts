import { IConfig, IConfigSubscriber } from '../common';

export class ConfigSubscriber implements IConfigSubscriber {
  constructor(
    private readonly config: IConfig,
  ) {}

  public update(key: string, value: any) {
    this.config.set(key, value);
  }
}
