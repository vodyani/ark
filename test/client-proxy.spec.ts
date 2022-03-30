/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable rest-spread-spacing */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from '@jest/globals';
import { FixedContext } from '@vodyani/core';

import { ClientProxy, AsyncClientProxy } from '../src/common/base';

class ClientAdapter {
  constructor(
    private readonly count: number,
    private readonly args: any[],
  ) {}

  getArgs = () => this.args;

  getCount = () => this.count;
}

class ClientManager {
  private client: any;

  @FixedContext
  // @ts-ignore
  public create(count: number, ...args: any[]) {
    this.client = new ClientAdapter(count, args);

    return {
      instance: this.client,
      close: () => {
        this.client = null;
      },
    };
  }

  @FixedContext
  // @ts-ignore
  public async asyncCreate(count: number, ...args: any[]) {
    this.client = new ClientAdapter(count, args);

    return {
      instance: this.client,
      close: async () => {
        this.client = null;
      },
    };
  }
}

const manager = new ClientManager();

describe('ClientProxy', () => {
  it('ClientProxy test', async () => {
    const clientProxy = new ClientProxy<ClientAdapter, number>();

    clientProxy.deploy(manager.create, 1, '2');

    expect(clientProxy.getClient().getCount()).toBe(1);

    expect(clientProxy.getClient().getArgs()).toEqual(['2']);

    clientProxy.redeploy(2);

    expect(clientProxy.getClient().getCount()).toBe(2);

    clientProxy.close();

    expect(clientProxy.getClient()).toBeNull();
  });
});

describe('AsyncClientProxy', () => {
  it('AsyncClientProxy test', async () => {
    const clientProxy = new AsyncClientProxy<ClientAdapter, number>();

    await clientProxy.deploy(manager.asyncCreate, 1, '2');

    expect(clientProxy.getClient().getCount()).toBe(1);

    expect(clientProxy.getClient().getArgs()).toEqual(['2']);

    clientProxy.redeploy(2);

    expect(clientProxy.getClient().getCount()).toBe(1);

    await clientProxy.redeploy(2);

    expect(clientProxy.getClient().getCount()).toBe(2);

    clientProxy.close();

    expect(clientProxy.getClient().getCount()).toBe(2);

    await clientProxy.close();

    expect(clientProxy.getClient()).toBeNull();
  });
});

