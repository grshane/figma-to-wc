import { Server, Request, ResponseToolkit} from '@hapi/hapi'
import * as Bell from '@hapi/bell'
import { request } from 'http';

const init = async () => {
  const server: Server = new Server({
    port: 3000,
    host:'localhost'
  });

  // Register Bell with server
  await server.register(Bell)

  server.auth.strategy('figma', 'bell', {
    provider: {
      name: 'figma',
      protocol: 'oauth2',
      useParamsAuth: false, // Swap to true if passing params vs Authorization header
      auth: 'someurl.com',
      token: 'some_token',
      headers: {},
    },
    password: 'some_password',
    clientId: 'figma_client_id',
    clientSecret: 'some_secret',
    isSecure: false // Remove this for non-local development
  })

  server.route([{
    method: 'GET',
    path: '/',
    handler: (request: Request, h: ResponseToolkit) => {
      return 'Hello world';
    }
  }, {
    method: ['GET', 'POST'],
    path: '/login',
    options: {
      auth: {
        mode: 'try', 
        strategy: 'figma'
      },
      handler: function (request: Request, h: ResponseToolkit) {
        if (!request.auth.isAuthenticated) {
          return `Authentication failed due to: ${request.auth.error.message}`
        }

        return h.redirect('/');
      }
    }
  }]);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1)
});

init();