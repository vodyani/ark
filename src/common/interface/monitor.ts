import { Method } from '@vodyani/utils';

export interface WatchInfo {
  key: any;
  value: any;
  callback: Method;
  hashToken: string;
}
