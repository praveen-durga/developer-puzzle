/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
import { Server } from '@hapi/hapi';
import * as Wreck from '@hapi/wreck';
import * as catBox from '@hapi/catbox';
import * as catBoxMemory from '@hapi/catbox-memory';

const init = async () => {

  const server = new Server({
    port: 3333,
    host: 'localhost',
    cache: [
      {
        name: 'memory-cache',
        provider: {
          constructor: require('@hapi/catbox-memory'),
          options: {
            partition: 'x'
          }
        }
      }
    ]
  });

  const _getData = path => {
    const url =
      'https://sandbox.iexapis.com/' +
      path +
      '?token=Tpk_a98615abdab44ad2a6bc5b07b385505f';
    console.log('Calling...   ' + url);
    return Wreck.get(url);
  };

  const dataCache = server.cache({
    cache: 'memory-cache',
    expiresIn: 60 * 1000,
    segment: '/',
    generateFunc: async id => {
      return null;
    },
    generateTimeout: 2500
  });

  server.route({
    method: '*',
    path: '/api/{path*}',
    options: {
      cors: {
        origin: ['*'],
        headers: [
          'Access-Control-Allow-Headers',
          'Access-Control-Allow-Origin',
          'Accept',
          'Authorization',
          'Content-Type',
          'If-None-Match',
          'Accept-language'
        ],
        additionalHeaders: [
          'Access-Control-Allow-Headers: Origin, Content-Type, x-ms-request-id , Authorization'
        ],
        credentials: true
      }
    },
    handler: async (request, resp) => {
      const path = request.params.path;
      console.log('Path=', path);
      try {
        const script = path.split('/')[2];
        let response = await dataCache.get({ id: script, path: path });

        if (!response) {
          console.log('Fetch from API ...');
          response = await _getData(path).then(data => data.payload.toString());
          dataCache.set(script, response);
        } else {
          console.log('Served from cache ...');
        }
        return resp.response(response);
      } catch (err) {
        return err;
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
