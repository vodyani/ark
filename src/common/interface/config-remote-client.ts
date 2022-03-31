export interface RemoteConfigClientSyncOptions {
  interval?: number;
  enableCycleSync?: boolean;
  enableSubscribe?: boolean;
}

export interface RemoteConfigClientOptions {
  initPath: string;
  initParam?: any[];
  sync?: RemoteConfigClientSyncOptions;
}
