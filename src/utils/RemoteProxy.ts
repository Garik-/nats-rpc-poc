import {
  JsonRpcId,
  ProxyRequest,
  ProxyResponse,
  JsonRpcError,
} from '../interfaces'
import { getId } from './'

const DEFAULT_TIMEOUT = 15000

interface ProxyRequestCallback {
  resolve: (data: any) => void
  reject: (error: Error) => void
}

export class RemoteProxy {
  private requestCallbacks: Map<JsonRpcId, ProxyRequestCallback>
  private requestTimeouts: Map<JsonRpcId, NodeJS.Timer>

  constructor() {
    this.requestCallbacks = new Map()
    this.requestTimeouts = new Map()
  }

  public getProxy<TRemoteService>(
    sendRequest: (request: ProxyRequest) => void,
    timeout = DEFAULT_TIMEOUT
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
            return async (...params: any): Promise<any> => {
              const id = getId()
              sendRequest({ id, method: prop, params })
              const promise = new Promise((resolve, reject) => {
                const timeoutTimer = setTimeout(() => {
                  this.deleteRequestCallback(id)
                  reject(new Error(`Request ${prop} timed out`))
                }, timeout)

                requestTimeouts.set(id, timeoutTimer)
                requestCallbacks.set(id, { resolve, reject })
              })
              return promise
            }
          } else {
            return () => {
              throw new Error('Cannot call private function')
            }
          }
        },
      }
    ) as TRemoteService
  }

  public getRequestCallbacks() {
    return this.requestCallbacks
  }

  public getRequestTimeouts() {
    return this.requestTimeouts
  }

  private deleteRequestTimeout(id: JsonRpcId) {
    const timer = this.requestTimeouts.get(id)
    if (timer) {
      clearTimeout(timer)
      this.requestTimeouts.delete(id)
    }
  }

  private deleteRequestCallback(id: JsonRpcId) {
    this.deleteRequestTimeout(id)
    this.requestCallbacks.delete(id)
  }

  public onMessage(message: ProxyResponse) {
    const { id, result, error } = message
    const callback = this.requestCallbacks.get(id)
    if (callback) {
      this.deleteRequestCallback(id)

      if (error) {
        if (error instanceof JsonRpcError) {
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
