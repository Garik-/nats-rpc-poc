# NATS JSON-RPC PoC
[![npm version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]

This library allows you to wrap your classes and use them over the network
## Usage
1. Wrap your class
```typescript
const natsTransportProvider = await NatsTransportProvider.create()
await natsTransportProvider.exposeService('MyService', new MyServiceClass())
```
1. Write client code
```typescript
const natsTransportProvider = await NatsTransportProvider.create()
const myService = await natsTransportProvider.getRemoteService<MyService>('MyService')

const result = await myService.anyMethod(param1, param2)
```
Don't forget to call `stopService` and `destory` for correctly close connection

## Environments & dependencies
Install node modules and start NATS on nats://localhost:4222
```bash
$ docker-compose up -d
$ yarn
```
## Example
Run in two different terminals
```bash
$ yarn start:service
```
```bash
$ yarn start:client
```
[npm-image]: https://img.shields.io/npm/v/nats-rpc-poc.svg?style=flat-square
[npm-url]: https://npmjs.org/package/nats-rpc-poc
[downloads-image]: http://img.shields.io/npm/dm/nats-rpc-poc.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/nats-rpc-poc