import { ConfigHandlerOptions } from './options';

export interface IConfigHandler<T = any> {
  /**
   * Set next handler.
   *
   * @param handler IConfigHandler
   *
   * @publicApi
   */
  setNext: (handler: IConfigHandler) => IConfigHandler;
  /**
   * Handler execute.
   *
   * @param options: ArkOptions
   *
   * @publicApi
   */
  execute: (options: ConfigHandlerOptions<T>) => Promise<void>;
}
