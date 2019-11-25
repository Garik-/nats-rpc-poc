import { connect, NatsConnectionOptions, Client, Subscription } from 'ts-nats'
import { MessagingProvider, RequestMessage } from './interfaces'
import { RemoteProxy } from './utils/RemoteProxy'

const defaultServers: NatsConnectionOptions['servers'] = [
  'nats://localhost:4222',
]

export class NatsTransportProvider implements MessagingProvider {
  private nc: Client
  private options: NatsConnectionOptions
  private services: Map<string, Subscription>

  private constructor(nc: Client, options: NatsConnectionOptions) {
    this.options = options
    this.nc = nc
    this.services = new Map()

    console.log('Connected to', options.servers)
  }

  public async destroy() {
    for (const name of this.services.keys()) {
      this.stopService(name)
    }

    this.nc.close()
    console.log('Disconnected to', this.options.servers)
  }

  static async create(): Promise<NatsTransportProvider> {
    const options: NatsConnectionOptions = { servers: defaultServers }
    const nc = await connect(options)
    return new NatsTransportProvider(nc, options)
  }

  public async exposeService(name: string, service: any) {
    console.log('exposeService', name, service)
    const subscribe = await this.nc.subscribe(name, (err, msg) => {
      console.log(err)
      console.log(msg)
    })
    this.services.set(name, subscribe)
  }

  public async getRemoteService<TRemoteService>(
    name: string
  ): Promise<TRemoteService> {
    const remoteProxy = new RemoteProxy()
    const proxy = remoteProxy.getProxy((request: RequestMessage) => {
      this.nc.publish(name, request)
    })

    const subscribe = await this.nc.subscribe(name, (err, msg) => {
      if (!err) {
        remoteProxy.onMessage(msg)
      }
      console.log(err)
      console.log(msg)
    })
    this.services.set(name, subscribe)

    return proxy as TRemoteService
  }

  public async stopService(name: string) {
    const subscribe = this.services.get(name)
    if (subscribe) {
      subscribe.unsubscribe()

      this.services.delete(name)
      console.log('stopService', name)
    }
  }
}
