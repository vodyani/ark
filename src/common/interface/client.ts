export interface Client<CLIENT = any> {
  client: CLIENT;
  close: () => void;
}
export interface AsyncClient<CLIENT = any> {
  client: CLIENT;
  close: () => Promise<void>;
}
