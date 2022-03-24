export interface MonitorDetails {
  configKey: any;

  configProperties: string;

  configPropertyRule: string;

  configValue: any;

  callback: (value: any) => void;
}
