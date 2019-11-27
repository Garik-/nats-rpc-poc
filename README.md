# NATS JSON-RPC PoC
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
Install node modules and start NAST on nast://localhost:4222
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
