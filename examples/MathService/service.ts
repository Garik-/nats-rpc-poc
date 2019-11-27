import { NatsTransportProvider } from '../../src/NatsTransportProvider'
import { MathService } from './MathService'

(async () => {
  try {
    const nc = await NatsTransportProvider.create()
    await nc.exposeService('MathService', new MathService())

    const close = async () => {
      await nc.stopService('MathService')
      await nc.destroy()
    }

    process.on('SIGINT', close)
    process.on('SIGTERM', close)
  } catch (ex) {
    console.error(ex)
  }
})()
