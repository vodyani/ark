import { resolve } from 'path';

import { describe, it, expect } from '@jest/globals';
import { IConfigLoader } from '@vodyani/core';
import { toHash, isValidString } from '@vodyani/utils';

import { JSONConfigLoader, ConfigClientSubscriber, LocalConfigClient, ConfigProvider } from '../../src';

interface File {
  json: {
    list: number[];
    name: string;
    age: number;
  };
  poller?: string;
}

describe('LocalConfigClient', () => {
  const jsonFilePath = resolve(__dirname, '../files/json-env');
  const config = new ConfigProvider<File>();
  const loader = new JSONConfigLoader(jsonFilePath, 'DEFAULT', 'LOCAL');

  it('LocalConfigClient', async () => {
    class DemoConfigClient extends LocalConfigClient {
      private hash: string;

      public init<T = any>(loader: IConfigLoader<T>) {
        const result = loader.execute();
        this.hash = toHash(result);
        return result;
      }

      public polling(): void {
        this.contrast({ poller: 'DemoConfigClient' });
      }

      public contrast(value: any) {
        if (isValidString(this.hash)) {
          const afterHash = toHash(value);
          const beforeHash = this.hash;

          if (afterHash !== beforeHash) {
            this.notify(value);
            this.hash = afterHash;
          }
        }
      }
    }

    const client = new DemoConfigClient();
    const subscriber = new ConfigClientSubscriber<File>(config);

    const value = client.init(loader);

    config.merge(value);
    client.subscribe(subscriber);
    client.polling();

    const { list, name, age } = config.get('json');
    const poller = config.search('poller');

    expect(poller).toBe('DemoConfigClient');
    expect(list).toEqual([1, 2]);
    expect(name).toBe('json');
    expect(age).toBe(3);

    client.unSubscribe();
  });
});
