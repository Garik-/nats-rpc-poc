import { RemoteProxy } from '../utils/RemoteProxy'
import { ProxyRequest } from '../interfaces/index'
import { describe, it } from 'mocha'
import { expect } from 'chai'

interface TestService {
  lol: (a: number, b: string) => Promise<void>
}

const checkEmptyMaps = (remoteProxy: RemoteProxy) => {
  const callbacks = remoteProxy.getRequestCallbacks()
  expect(callbacks.size).to.equal(0)

  const timeouts = remoteProxy.getRequestTimeouts()
  expect(timeouts.size).to.equal(0)
}

describe('RemoteProxy uint test', () => {
  it('TestService proxy', async () => {
    const remoteProxy = new RemoteProxy()
    const proxy = remoteProxy.getProxy<TestService>(
      ({ method, params }: ProxyRequest) => {
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
      ({ method, params, id }: ProxyRequest) => {
        expect(method).to.equal('lol')
        expect(params).to.deep.equal([1, 'test'])

        setTimeout(() => {
          remoteProxy.onMessage({ id, result: 'blabla' })
        }, 10)
      },
      1000
    )

    const result = await proxy.lol(1, 'test')
    expect(result).to.equal('blabla')

    checkEmptyMaps(remoteProxy)
  })
})
