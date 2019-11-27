export interface MessagingProvider {
  // create: () => Promise<MessagingProvider>
  destroy: () => Promise<void>
  exposeService: (name: string, service: any) => Promise<void>
  stopService: (name: string) => Promise<void>
  getRemoteService: <TRemoteService>(name: string) => Promise<TRemoteService>
}
