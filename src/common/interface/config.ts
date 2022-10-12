import { ConfigHandlerOptions } from './options';

interface Observer {
  contrast: (...args: any[]) => void;
  subscribe: (...args: any[]) => void | Promise<void>;
  notify: (...args: any[]) => void;
  polling: (...args: any[]) => void | Promise<void>;
  unPolling: (...args: any[]) => void | Promise<void>;
  unSubscribe: (...args: any[]) => void;
}

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
   * Replace the configuration with property key.
   *
   * @param key string The property of configuration.
   * @param value any The configuration value.
   *
   * @publicApi
   */
  replace: (key: string, value: any) => void;
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

export interface IConfigClientSubscriber {
  /**
   * Updating Configuration.
   *
   * @param value any The configuration value.
   *
   * @publicApi
   */
  update: (value: any) => void | Promise<void>
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

export interface IConfigObserver extends Observer {
  /**
   * Contrasting configuration.
   *
   * @param key string The property of configuration.
   * @param value any The configuration value.
   *
   * @publicApi
   */
  contrast: (key: string, value: any) => void;
  /**
  * Register the subscriber inside client by the key of configuration.
  *
  * @param key string The key of configuration.
  * @param subscriber IConfigSubscriber The configuration subscriber..
  *
  * @publicApi
  */
  subscribe: (key: string, subscriber: IConfigSubscriber) => void;
  /**
  * Notify subscribers of configuration updates.
  *
  * @param key string The key of configuration.
  * @param value any The configuration value.
  *
  * @publicApi
  */
  notify: (key: string, value: any) => void;
  /**
  * Open the polling.
  *
  * @publicApi
  */
  polling: () => void;
  /**
  * Close the polling.
  *
  * @publicApi
  */
  unPolling: () => void;
  /**
  * Remove the subscriber from client by the key of configuration..
  *
  * @param key string The key of configuration.
  *
  * @publicApi
  */
  unSubscribe: (key: string) => void;
}

export interface IConfigClient extends Observer {
  /**
   * Load configuration.
   *
   * @param loader: IConfigLoader<T>
   *
   * @publicApi
   */
  init: <T = any>(loader: IConfigLoader) => T | Promise<T>;
  /**
   * Contrasting configuration.
   *
   * @param value any The configuration value.
   *
   * @publicApi
   */
  contrast: (value: any) => void;
  /**
  * Register the subscriber inside client by the key of configuration.
  *
  * @param subscriber IConfigClientSubscriber The configuration client subscriber.
  *
  * @publicApi
  */
  subscribe: (subscriber: IConfigClientSubscriber) => void;
  /**
  * Notify subscribers of configuration updates.
  *
  * @param value any The configuration value.
  *
  * @publicApi
  */
  notify: (value: any) => void;
  /**
  * Open the polling.
  *
  * @publicApi
  */
  polling: () => void;
  /**
  * Close the polling.
  *
  * @publicApi
  */
  unPolling: () => void;
  /**
  * Remove the subscriber from client by the key of configuration..
  *
  * @publicApi
  */
  unSubscribe: () => void;
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
