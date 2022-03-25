import { RemoteConfigClientSyncCallBack, RemoteConfigClientInitCallBack } from '../type';

export interface RemoteConfigClient {
  init: RemoteConfigClientInitCallBack;

  sync: RemoteConfigClientSyncCallBack;

  subscribe?: (callback: (details: Record<string, any>) => any) => Promise<void>;
}

export interface RemoteConfigClientOptions {
  remoteClientInitArgs?: any[];

  enableSubscribe?: boolean;

  enableCycleSync?: boolean;

  interval?: number;

  path: string;
}
