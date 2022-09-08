export interface WatchInfo {
  key: string;
  value: any;
  hashToken: string;
  callback: (config: Partial<any>) => any;
}
