import { ConfigHandlerOptions } from './options';

export interface IConfig<T = any> {
  /**
   * Deep search the configuration with property key.
   *
   * @param key string The property of configuration.
   *
   * @publicApi
   */
  get: <V = any>(key: string) => V;
  /**
   * Search the configuration with property key.
   *
   * @param key string The property of configuration.
   *
   * @publicApi
   */
  search: <K extends keyof T>(key: K) => T[K]
  /**
   * Set the configuration with property key.
   *
   * @param key string The property of configuration.
   * @param value any The configuration value.
   *
   * @publicApi
   */
  set: (key: string, value: any) => void;
  /**
   * Merge the configuration.
   *
   * @param config any The configuration.
   *
   * @publicApi
   */
  merge: (config: T) => void;
}

export interface IConfigSubscriber {
  /**
   * Updating Configuration.
   *
   * @param key string The property of configuration.
   * @param value any The configuration value.
   *
   * @publicApi
   */
  update: (key: string, value: any) => void | Promise<void>
}

export interface IConfigLoader {
  /**
   * Load configuration.
   *
   * @publicApi
   */
  execute: <T = any>() => T;
}

export interface IConfigPoller {
  /**
   * Open the polling.
   *
   * @publicApi
   */
  execute: () => void;
  /**
   * Close the polling.
   *
   * @publicApi
   */
  close: () => void | Promise<void>;
}

export interface IConfigObserver {
  /**
   * Contrasting configuration.
   *
   * @param key string The property of configuration.
   * @param value any The configuration value.
   *
   * @publicApi
   */
  contrast?: (key: string, value: any) => void;
  /**
  * Register the subscriber inside client by the key of configuration.
  *
  * @param key string The key of configuration.
  * @param value any The configuration value.
  *
  * @publicApi
  */
  subscribe?: (key: string, subscriber: IConfigSubscriber) => void;
  /**
  * Notify subscribers of configuration updates.
  *
  * @param key string The key of configuration.
  * @param value any The configuration value.
  *
  * @publicApi
  */
  notify?: (key: string, value: any) => void;
  /**
  * Open the polling.
  *
  * @publicApi
  */
  polling?: () => void | Promise<void>;
  /**
  * Close the polling.
  *
  * @publicApi
  */
  unPolling?: () => void | Promise<void>;
  /**
  * Remove the subscriber from client by the key of configuration..
  *
  * @param key string The key of configuration.
  *
  * @publicApi
  */
  unSubscribe?: (key: string) => void;
}

export interface IConfigClient extends IConfigObserver {
  /**
   * Load configuration.
   *
   * @param loader: IConfigLoader<T>
   *
   * @publicApi
   */
  load: <T = any>(loader: IConfigLoader) => T | Promise<T>;
  /**
   * Register the subscriber inside client.
   *
   * @param key string The key of configuration.
   * @param value any The configuration value.
   *
   * @publicApi
   */
  subscribeAll?: (subscriber: IConfigSubscriber) => void;
  /**
   * Remove the subscriber from client.
   *
   * @publicApi
   */
  unSubscribeAll?: () => void;
}

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
