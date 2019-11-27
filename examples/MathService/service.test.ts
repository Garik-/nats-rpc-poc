import { describe, it } from 'mocha'
import { expect } from 'chai'

import { NatsTransportProvider } from '../../src/NatsTransportProvider'
import { MathServiceImp } from './MathService'

describe('MathService client', async () => {
  let nc: NatsTransportProvider, mathService: MathServiceImp

  before(async () => {
    nc = await NatsTransportProvider.create()
    mathService = await nc.getRemoteService<MathServiceImp>('MathService')
  })

  after(async () => {
    await nc.stopService('MathService')
    await nc.destroy()
  })

  it('When send 1+1, return 2', async () => {
    const result = await mathService.sum(1, 1)
    expect(result).to.equal(1 + 1)
  })

  it('When send two requests at the same time', async () => {
    const nc2 = await NatsTransportProvider.create()
    const ms2 = await nc.getRemoteService<MathServiceImp>('MathService')

    const results = await Promise.all([ms2.sum(2, 2), mathService.sum(1, 1)])

    expect(results[0]).to.equal(2 + 2)
    expect(results[1]).to.equal(1 + 1)

    await nc2.stopService('MathService')
    await nc2.destroy()
  })
})
