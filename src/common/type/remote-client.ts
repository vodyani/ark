export type RemoteConfigClientSyncCallBack = () => Promise<any>;
export type RemoteConfigClientInitCallBack = (path: string, ...args: any[]) => Promise<void>;
