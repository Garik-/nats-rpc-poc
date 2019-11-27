# NATS JSON-RPC PoC
[![npm version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]

This library allows you to wrap your classes and use them over the network
## Usage
1. Wrap your class
```TypeScript
const nastTransportProvider = await NatsTransportProvider.create()
await nastTransportProvider.exposeService('MyService', new MyServiceClass())
```
2. Write client code
```TypeScript
const nastTransportProvider = await NatsTransportProvider.create()
const myService = await nastTransportProvider.getRemoteService<MyService>('MyService')

const result = await myService.anyMethod(param1, param2)
```
Don't forget to call `stopService` and `destory` for correctly close connection

## Environments & dependencies
Install node modules and start NATS on nats://localhost:4222
```BASH
$ docker-compose up -d
$ yarn
```
## Example
Run in two different terminals
```BASH
$ yarn start:service
```
```BASH
$ yarn start:client
```
[npm-image]: https://img.shields.io/npm/v/nats-rpc-poc.svg?style=flat-square
[npm-url]: https://npmjs.org/package/nats-rpc-poc
[downloads-image]: http://img.shields.io/npm/dm/nats-rpc-poc.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/nats-rpc-poc
