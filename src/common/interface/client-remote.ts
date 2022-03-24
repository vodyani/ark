export interface ConfigRemoteClient<T = any> {
  init: (...args: any[]) => Promise<void>;

  getAll: () => Promise<T>;

  subscribe?: (callback: (details: Record<string, any>) => any) => Promise<void>;
}

export interface ConfigRemoteClientOptions<T = any> {
  remoteClient: ConfigRemoteClient<T>;

  remoteArgs?: any[];

  enableSubscribe?: boolean;

  enableCycleSync?: boolean;

  interval?: number;
}
