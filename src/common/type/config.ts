export type ConfigStore<T> = { [P in keyof T]: T[P]; };
