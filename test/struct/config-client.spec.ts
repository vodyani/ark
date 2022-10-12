import { resolve } from 'path';

import { describe, it, expect } from '@jest/globals';

import { JSONConfigLoader, ConfigClientSubscriber, AbstractConfigClient, ConfigProvider } from '../../src';

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
    class DemoConfigClient extends AbstractConfigClient {
      public polling(): void {
        this.contrast({ poller: 'DemoConfigClient' });
        super.polling();
        super.unPolling();
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
