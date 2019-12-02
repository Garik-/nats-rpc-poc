import {
  parseJsonRpc,
  jsonrpc as jsonRpcVersion,
} from '../utils/JsonRpcMarshaller'
import { JsonRpcResponse, JsonRpcErrorCode } from '../interfaces/JsonRpc'
import { describe, it } from 'mocha'
import { expect } from 'chai'

const validResponseWithError =
  '{"jsonrpc":"2.0","id":"ud1c0iusnzoekbpbueoc7w","error":{"code":-32603,"message":"error message","data":"123"}}'

describe('JsonRpcMarshaller unit test', () => {
  it('When parse error, then return JsonRpcResponseError', () => {
    const { jsonrpc, id, error }: JsonRpcResponse = parseJsonRpc(
      validResponseWithError
    )
    expect(jsonrpc).to.be.equal(jsonRpcVersion)
    expect(id).to.be.a('string')
    expect(error).to.have.property('code')
    expect(error).to.have.property('message')
  })

  it('When parse invalid version response, then return JsonRpcError', () => {
    try {
      parseJsonRpc('{"jsonrpc":"123","id":"ud1c0iusnzoekbpbueoc7w"}')
    } catch (error) {
      expect(error).to.be.a('jsonrpcerror')
      expect(error.code).to.be.equal(JsonRpcErrorCode.INVALID_REQUEST)
    }
  })
})
