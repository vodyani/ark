import { RemoteConfigClientSyncCallBack, RemoteConfigClientInitCallBack } from '../type';

export interface RemoteConfigClient {
  init: RemoteConfigClientInitCallBack;

  sync: RemoteConfigClientSyncCallBack;

  subscribe?: (callback: (details: Record<string, any>) => any) => Promise<void>;
}

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
