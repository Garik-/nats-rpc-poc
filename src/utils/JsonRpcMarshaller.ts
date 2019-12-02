import {
  JsonRpcResponse,
  JsonRpcErrorCode,
  JsonRpcError,
  JsonRpcRequest,
  JsonRpcVersion,
} from '../interfaces/JsonRpc'

export const jsonrpc: JsonRpcVersion = '2.0'

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
    if (!('id' in json) || !('jsonrpc' in json) || json.jsonrpc !== jsonrpc) {
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
