export interface WatchInfo {
  key: string;
  value: any;
  hashToken: string;
  callback: <T = any>(config: Partial<T>) => any;
}
