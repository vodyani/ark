/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable rest-spread-spacing */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from '@jest/globals';
import { FixedContext } from '@vodyani/core';

import { ClientProxy, AsyncClientProxy } from '../src/common/base';

class Client {
  constructor(
    private readonly count: number,
    private readonly args: any[],
  ) {}

  getArgs = () => this.args;

  getCount = () => this.count;
}

class ClientManager {
  private instance: any;

  @FixedContext
  // @ts-ignore
  public create(count: number, ...args: any[]) {
    this.instance = new Client(count, args);

    return {
      client: this.instance,
      close: () => {
        this.instance = null;
      },
    };
  }

  @FixedContext
  // @ts-ignore
  public async asyncCreate(count: number, ...args: any[]) {
    this.instance = new Client(count, args);

    return {
      client: this.instance,
      close: async () => {
        this.instance = null;
      },
    };
  }
}

const manager = new ClientManager();

describe('ClientProxy', () => {
  it('ClientProxy test', async () => {
    const clientProxy = new ClientProxy<Client, number>();

    clientProxy.deploy(manager.create, 1, '2');

    expect(clientProxy.get().getCount()).toBe(1);

    expect(clientProxy.get().getArgs()).toEqual(['2']);

    clientProxy.redeploy(2);

    expect(clientProxy.get().getCount()).toBe(2);

    clientProxy.close();

    expect(clientProxy.get()).toBeNull();
  });
});

describe('AsyncClientProxy', () => {
  it('AsyncClientProxy test', async () => {
    const clientProxy = new AsyncClientProxy<Client, number>();

    await clientProxy.deploy(manager.asyncCreate, 1, '2');

    expect(clientProxy.get().getCount()).toBe(1);

    expect(clientProxy.get().getArgs()).toEqual(['2']);

    clientProxy.redeploy(2);

    expect(clientProxy.get().getCount()).toBe(1);

    await clientProxy.redeploy(2);

    expect(clientProxy.get().getCount()).toBe(2);

    clientProxy.close();

    expect(clientProxy.get().getCount()).toBe(2);

    await clientProxy.close();

    expect(clientProxy.get()).toBeNull();
  });
});

