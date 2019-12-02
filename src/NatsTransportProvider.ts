import { connect, NatsConnectionOptions, Client, Subscription } from 'ts-nats'
import { MessagingProvider } from './interfaces/MessagingProvider'
import { JsonRpcRequest, JsonRpcResponse } from './interfaces/JsonRpc'
import { RemoteProxy } from './utils/RemoteProxy'
import { ServiceWrapper } from './utils/ServiceWrapper'
import { parseJsonRpc, stringifyJsonRpc } from './utils/JsonRpcMarshaller'

const defaultServers: NatsConnectionOptions['servers'] = [
  process.env.NATS_SERVER || 'nats://localhost:4222',
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

    const wrapper = new ServiceWrapper(service, (response: JsonRpcResponse) =>
      this.nc.publish(name + '_response', stringifyJsonRpc(response))
    )

    const subscribe = await this.nc.subscribe(name + '_request', (err, msg) => {
      if (err !== null) {
        console.error(err)
      } else {
        const request = parseJsonRpc(msg.data)
        wrapper.onRequest(request as JsonRpcRequest)
      }
    })

    this.services.set(name, subscribe)
  }

  public async getRemoteService<TRemoteService>(
    name: string
  ): Promise<TRemoteService> {
    const remoteProxy = new RemoteProxy()
    const proxy = remoteProxy.getProxy((request: JsonRpcRequest) => {
      this.nc.publish(name + '_request', stringifyJsonRpc(request))
    })

    const subscribe = await this.nc.subscribe(
      name + '_response',
      (err, msg) => {
        if (err !== null) {
          console.error(err)
        } else {
          const response = parseJsonRpc(msg.data)
          remoteProxy.onMessage(response as JsonRpcResponse)
        }
      }
    )
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
