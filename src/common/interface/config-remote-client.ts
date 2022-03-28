export interface RemoteConfigClientSyncOptions {
  interval?: number;

  enableCycleSync?: boolean;

  enableSubscribe?: boolean;
}

export interface RemoteConfigClientInitOptions {
  path: string;

  args?: any[];
}

export interface RemoteConfigClientOptions {
  initOptions: RemoteConfigClientInitOptions;

  syncOptions?: RemoteConfigClientSyncOptions;
}
