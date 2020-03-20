/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
import { Server } from '@hapi/hapi';
import * as Wreck from '@hapi/wreck';

const init = async () => {
  const server = new Server({
    port: 3333,
    host: 'localhost'});

  const _getData = (path, next) => {
    const url = 'https://sandbox.iexapis.com/' + path + '?token=Tpk_a98615abdab44ad2a6bc5b07b385505f';
    console.log('Calling...   ' + url);
    return Wreck.get(url).then((data) => {
      return data;
    }, (err) => {
      return err;
    });
  };

  server.method('getData', _getData, {
    cache: {
      expiresIn: 60000,
      staleIn: 2000,
      staleTimeout: 2000,
      generateTimeout: 10000
    },
    generateKey: (path) =>  path
  });

  server.route({
    method: '*',
    path: '/api/{path*}',
    options: {
      cors: {
        origin: [
          '*'
        ],
        headers: ["Access-Control-Allow-Headers", "Access-Control-Allow-Origin", "Accept", "Authorization", "Content-Type", "If-None-Match", "Accept-language"],
        additionalHeaders: ["Access-Control-Allow-Headers: Origin, Content-Type, x-ms-request-id , Authorization"],
        credentials: true
      },
      cache: { expiresIn: 20000 }
    },
    handler: async (request, resp) => {
      const path = request.params.path;
      console.log('Path=', path);
      const response = await server.methods.getData(path);
      return resp.response(JSON.parse(response.payload) || response);
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
