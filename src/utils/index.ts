import {
  JsonRpcId,
  JsonRpcVersion,
  RequestMessage,
  ResponseMessage,
  ResponseError,
  JsonRpcError,
  ProxyResponse,
  ProxyRequest,
} from '../interfaces'

export const getId = (): string =>
  Math.random()
    .toString(36)
    .substring(2, 15) +
  Math.random()
    .toString(36)
    .substring(2, 15)

const jsonrpc: JsonRpcVersion = '2.0'

export const createRequest = ({
  method,
  params,
  id,
}: ProxyRequest): RequestMessage => {
  const request: RequestMessage = { jsonrpc, method, id }
  if (params) {
    request.params = params
  }
  return request
}

const createResponseError = (e: JsonRpcError): ResponseError => {
  const { message, stack, code } = e
  const responseError: ResponseError = {
    code,
    message,
  }
  if (stack) {
    responseError.data = stack
  }
  return responseError
}

export const createResponse = ({
  id,
  result,
  error,
}: ProxyResponse): ResponseMessage => {
  const response: ResponseMessage = {
    jsonrpc,
    id,
  }

  if (error) {
    // response.error = createResponseError(error)
  }

  if (result) {
    response.result = result
  }

  return response
}
