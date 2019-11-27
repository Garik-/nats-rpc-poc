import {
  JsonRpcResponse,
  JsonRpcVersion,
  JsonRpcErrorCode,
  JsonRpcError,
  JsonRpcRequest,
} from '../interfaces/JsonRpc'

export const jsonrpc: JsonRpcVersion = '2.0'

export const getId = (): string =>
  Math.random()
    .toString(36)
    .substring(2, 15) +
  Math.random()
    .toString(36)
    .substring(2, 15)

const createError = (
  error: JsonRpcError
): JsonRpcResponse | JsonRpcRequest => ({
  id: null,
  jsonrpc,
  error,
})

export const parseJsonRpc = (msg: string): JsonRpcResponse | JsonRpcRequest => {
  try {
    const json = JSON.parse(msg)
    if (!('id' in json) || !('jsonrpc' in json)) {
      return createError(
        new JsonRpcError('Invalid request', JsonRpcErrorCode.INVALID_REQUEST)
      )
    }

    return json as JsonRpcResponse | JsonRpcRequest
  } catch (e) {
    console.error(e)
  }

  return createError(
    new JsonRpcError('Parse error', JsonRpcErrorCode.PARSE_ERROR)
  )
}
