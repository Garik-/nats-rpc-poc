import {
  JsonRpcResponse,
  JsonRpcVersion,
  JsonRpcErrorCode,
  JsonRpcError,
} from '../interfaces'

export const jsonrpc: JsonRpcVersion = '2.0'

export const getId = (): string =>
  Math.random()
    .toString(36)
    .substring(2, 15) +
  Math.random()
    .toString(36)
    .substring(2, 15)

const createErrorResponse = (error: JsonRpcError): JsonRpcResponse => ({
  id: null,
  jsonrpc,
  error,
})

export const parseJsonRpcResponse = (msg: string): JsonRpcResponse => {
  try {
    const json = JSON.parse(msg)
    if (!('id' in json) || !('jsonprc' in json)) {
      return createErrorResponse(
        new JsonRpcError('Invalid request', JsonRpcErrorCode.INVALID_REQUEST)
      )
    }

    return json as JsonRpcResponse
  } catch (e) {
    console.error(e)
  }

  return createErrorResponse(
    new JsonRpcError('Parse error', JsonRpcErrorCode.PARSE_ERROR)
  )
}
