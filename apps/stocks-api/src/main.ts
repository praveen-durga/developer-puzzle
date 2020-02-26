/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
import { Server } from '@hapi/hapi';

import * as H2o2 from '@hapi/h2o2';

const init = async () => {
  const server = new Server({
    port: 3333,
    host: 'localhost'
  });
  await server.register(H2o2);

  server.route({
    method: '*',
    path: '/{path*}',
    handler: {
      proxy: {
        host: 'sandbox.iexapis.com',
        port: 443,
        protocol: 'https',
        passThrough: true,
        redirects: 5
      }
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
