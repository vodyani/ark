export interface WatchInfo {
  key: string;
  value: any;
  hashToken: string;
  callback: (config: any) => any;
}
