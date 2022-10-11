import { IConfigSubscriber } from './config';

export interface IClient<T = any, C = any> {
  /**
   * Close the client.
   *
   * @publicApi
   */
  close: () => void | Promise<void>;
  /**
   * Get the client instance.
   *
   * @publicApi
   */
  connect: () => T;
  /**
   * Create the client instance.
   *
   * @param config C The configuration of client instance
   *
   * @publicApi
   */
  create: (config: C) => T | Promise<T>;
  /**
   * Redeploy the client instance.
   *
   * @param config C The configuration of client instance
   *
   * @publicApi
   */
  redeploy: (config: C) => T | Promise<T>;
}

export interface IClientMediator<T = any, C = any> extends IConfigSubscriber {
  /**
   * Destroy the client from mediator.
   *
   * @param key string The key of client.
   *
   * @publicApi
   */
  destroy: (key: string) => void | Promise<void>;
  /**
   * Deploy the client inside to mediator.
   *
   * @param key string The key of client.
   * @param client IClient<T, C> The client.
   *
   * @publicApi
   */
  deploy: (key: string, client: IClient<T, C>) => void | Promise<void>;
  /**
   * Redeploy the client inside to mediator.
   *
   * @param key string The key of client.
   *
   * @publicApi
   */
  redeploy: (key: string, config: C) => void | Promise<void>;
  /**
   * Get the client from mediator.
   *
   * @param key string The key of client.
   *
   * @publicApi
   */
  getClient: (key: string) => IClient<T, C>;
}
