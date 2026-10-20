   import '@testing-library/jest-dom/vitest';
   import { server } from './mocks/server';

   beforeAll(() => {
     server.listen({ onUnhandledRequest: 'error' });
     // jsdom's AbortSignal is rejected by Node's fetch, so drop the signal in tests only.
     const mswFetch = globalThis.fetch;
     globalThis.fetch = (input, init) =>
       mswFetch(input, init ? { ...init, signal: undefined } : init);
   });
   afterEach(() => server.resetHandlers());
   afterAll(() => server.close());