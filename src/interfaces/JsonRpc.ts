export type JsonRpcVersion = '2.0'
export type JsonRpcId = string | number | null
export enum JsonRpcErrorCode {
  /**
   * Invalid JSON was received by the server.
   * or An error occurred on the server while parsing the JSON text.
   */
  PARSE_ERROR = -32700,
  /**
   * The JSON sent is not a valid Request object.
   */
  INVALID_REQUEST = -32600,
  /**
   * The method does not exist / is not available.
   */
  METHOD_NOT_FOUND = -32601,
  /**
   * Invalid method parameter(s).
   */
  INVALID_PARAMS = -32602,
  /**
   * Internal JSON-RPC error.
   */
  INTERNAL_ERROR = -32603,
  /**
   * Reserved for implementation-defined server-errors.
   */
  SERVER_ERROR = -32000,
}

export class JsonRpcError extends Error {
  public code: JsonRpcErrorCode
  constructor(
    message: string,
    code: JsonRpcErrorCode = JsonRpcErrorCode.INTERNAL_ERROR
  ) {
    super(message)
    this.code = code

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, JsonRpcError.prototype)
  }

  static fromError(
    err: Error,
    code: JsonRpcErrorCode = JsonRpcErrorCode.INTERNAL_ERROR
  ): JsonRpcError {
    const e = err as JsonRpcError
    e.code = code

    return e
  }
}

export interface JsonRpcRequest {
  jsonrpc: JsonRpcVersion
  method: string
  params?: any
  id: JsonRpcId
}

export interface JsonRpcResponseError {
  code: JsonRpcErrorCode
  message: string
  data?: any
}

export interface JsonRpcResponse {
  jsonrpc: JsonRpcVersion
  result?: any
  error?: JsonRpcResponseError
  id: JsonRpcId
}
