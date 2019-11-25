import { ProxyRequest, ProxyResponse, ProxyMessageId } from '../interfaces'
import { getId } from './'

const DEFAULT_TIMEOUT = 15000

interface ProxyRequestCallback {
  resolve: (data: any) => void
  reject: (error: Error) => void
}

export class RemoteProxy {
  private requestCallbacks: Map<ProxyMessageId, ProxyRequestCallback>
  private requestTimeouts: Map<ProxyMessageId, NodeJS.Timer>

  constructor() {
    this.requestCallbacks = new Map()
    this.requestTimeouts = new Map()
  }

  public getProxy<TRemoteService>(
    sendRequest: (request: ProxyRequest) => void,
    requestTimeoutMs = DEFAULT_TIMEOUT
  ): TRemoteService {
    const requestCallbacks = this.requestCallbacks
    const requestTimeouts = this.requestTimeouts
    return new Proxy(
      {},
      {
        get: (target, prop: string) => {
          switch (prop) {
            case 'then':
            case 'constructor':
            case 'inspect':
            case 'on':
              return null
          }
          if (typeof prop === 'symbol') return null

          if (prop && prop.startsWith && !prop.startsWith('_')) {
            return (...params: any): Promise<any> =>
              new Promise((resolve, reject) => {
                const id = getId()
                sendRequest({ id, method: prop, params })
                const timeout = setTimeout(() => {
                  this.deleteRequestCallback(id)
                  reject(new Error(`Request ${prop} timed out`))
                }, requestTimeoutMs)

                requestTimeouts.set(id, timeout)
                requestCallbacks.set(id, { resolve, reject })
              })
          }

          return () => {
            throw new Error('Cannot call private function')
          }
        },
      }
    ) as TRemoteService
  }

  public getRequestCallbacksCount() {
    return this.requestCallbacks.size
  }

  public getRequestTimeoutsCount() {
    return this.requestTimeouts.size
  }

  private deleteRequestTimeout(id: ProxyMessageId) {
    const timer = this.requestTimeouts.get(id)
    if (timer) {
      clearTimeout(timer)
      this.requestTimeouts.delete(id)
    }
  }

  private deleteRequestCallback(id: ProxyMessageId) {
    this.deleteRequestTimeout(id)
    this.requestCallbacks.delete(id)
  }

  public onMessage(message: ProxyResponse) {
    const { id, result, error } = message
    const callback = this.requestCallbacks.get(id)
    if (callback) {
      this.deleteRequestCallback(id)

      if (error) {
        if (error instanceof Error) {
          callback.reject(error)
        } else {
          throw new Error(`[${id}] onMessage: error not valid type`)
        }
      } else {
        callback.resolve(result)
      }
    }
  }
}
