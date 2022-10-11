import { IConfigClient, IConfigLoader } from '../common';

export class LocalConfigClient implements IConfigClient {
  public load<T = any>(loader: IConfigLoader) {
    return loader.execute<T>();
  }
}
