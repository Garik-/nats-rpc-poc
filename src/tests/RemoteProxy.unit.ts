import { RemoteProxy } from '../utils/RemoteProxy'
import { JsonRpcRequest, JsonRpcError } from '../interfaces/JsonRpc'
import { describe, it } from 'mocha'
import { expect } from 'chai'

interface TestService {
  lol: (a: number, b: string) => Promise<void>
}

const jsonrpc = '2.0'

const checkEmptyMaps = (remoteProxy: RemoteProxy) => {
  expect(remoteProxy.getRequestCallbacksCount()).to.equal(0)
  expect(remoteProxy.getRequestTimeoutsCount()).to.equal(0)
}

describe('RemoteProxy uint test', () => {
  it('TestService proxy', async () => {
    const remoteProxy = new RemoteProxy()
    const proxy = remoteProxy.getProxy<TestService>(
      ({ method, params }: JsonRpcRequest) => {
        expect(method).to.equal('lol')
        expect(params).to.deep.equal([1, 'test'])
      },
      10
    )

    try {
      await proxy.lol(1, 'test')
    } catch (err) {
      const { message } = err
      expect(message).to.equal('Request lol timed out')
    }

    checkEmptyMaps(remoteProxy)
  })

  it('Await result', async () => {
    const remoteProxy = new RemoteProxy()
    const proxy = remoteProxy.getProxy<TestService>(
      ({ method, params, id }: JsonRpcRequest) => {
        expect(method).to.equal('lol')
        expect(params).to.deep.equal([1, 'test'])

        setTimeout(() => {
          remoteProxy.onMessage({ jsonrpc, id, result: 'blabla' })
        }, 10)
      },
      1000
    )

    const result = await proxy.lol(1, 'test')
    expect(result).to.equal('blabla')

    checkEmptyMaps(remoteProxy)
  })

  it('Await error', async () => {
    const remoteProxy = new RemoteProxy()
    const proxy = remoteProxy.getProxy<TestService>(
      ({ method, params, id }: JsonRpcRequest) => {
        expect(method).to.equal('lol')
        expect(params).to.deep.equal([1, 'test'])

        setTimeout(() => {
          remoteProxy.onMessage({
            jsonrpc,
            id,
            error: new JsonRpcError('error message'),
          })
        }, 10)
      },
      1000
    )

    try {
      await proxy.lol(1, 'test')
    } catch (err) {
      expect(err.message).to.equal('error message')
    }

    checkEmptyMaps(remoteProxy)
  })
})
