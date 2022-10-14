import { resolve } from 'path';

import { describe, expect, it } from '@jest/globals';

import { ConfigClientSubscriber, ConfigHandlerOptions, ConfigProvider, JSONConfigLoader, LocalConfigClient } from '../../src';
import { ConfigArgumentHandler, ConfigClientHandler } from '../../src/struct/config-handler';

interface File {
  env: string;
  json: {
    list: number[];
    name: string;
    age: number;
  };
  poller?: string;
}

class DemoConfigClient extends LocalConfigClient {
  public polling(): void {
    this.contrast({ poller: 'DemoConfigClient' });
    super.polling();
    super.unPolling();
  }
}

const options: ConfigHandlerOptions = {
  args: {
    env: 'LOCAL',
  },
  clients: [{
    loader: new JSONConfigLoader(resolve(__dirname, '../files/json-env'), 'DEFAULT', 'LOCAL'),
    client: new DemoConfigClient(),
    enablePolling: true,
    enableSubscribe: true,
  }],
  enableDynamicDataSource: false,
};

describe('ConfigHandlers', () => {
  it('assembler', async () => {
    const handlers = [];
    const config = new ConfigProvider<File>();
    const handler = new ConfigArgumentHandler(config);

    if (options.clients) {
      const subscriber = new ConfigClientSubscriber<File>(config);
      const clientHandler = new ConfigClientHandler(config, subscriber);

      handlers.push(clientHandler);
    }

    while (handlers.length > 0) {
      handler.setNext(handlers.shift());
    }

    await handler.execute(options);

    const { list, name, age } = config.get('json');

    expect(list).toEqual([1, 2]);
    expect(name).toBe('json');
    expect(age).toBe(3);

    expect(config.search('env')).toBe('LOCAL');
    expect(config.search('poller')).toBe('DemoConfigClient');
  });
});
