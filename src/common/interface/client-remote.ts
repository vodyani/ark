export interface RemoteConfigClient<T = any> {
  init: (...args: any[]) => Promise<void>;

  getAll: () => Promise<T>;

  subscribe?: (callback: (details: Record<string, any>) => any) => Promise<void>;
}

export interface RemoteConfigClientOptions<T = any> {
  remoteClient: RemoteConfigClient<T>;

  remoteClientInitArgs?: any[];

  enableSubscribe?: boolean;

  enableCycleSync?: boolean;

  interval?: number;
}
