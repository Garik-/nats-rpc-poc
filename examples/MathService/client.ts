import { NatsTransportProvider } from '../../src/NatsTransportProvider'
import { MathServiceImp } from './MathService'
;(async () => {
  try {
    const nc = await NatsTransportProvider.create()
    const mathService = await nc.getRemoteService<MathServiceImp>('MathService')

    const close = async () => {
      await nc.stopService('MathService')
      await nc.destroy()
    }

    let i = 0
    const timer = setInterval(async () => {
      try {
        const result = await mathService.sum(1, 1)
        console.log({ result })
      } catch (err) {
        console.log(err)
        clearInterval(timer)
        close()
      }

      i++
      if (i === 10) {
        clearInterval(timer)
        close()
      }
    }, 600)

    process.on('SIGINT', close)
    process.on('SIGTERM', close)

    // close()
  } catch (ex) {
    console.error(ex)
  }
})()
