import * as Wreck from '@hapi/wreck';

export const cachePlugin = {
  name: 'cachePlugin',
  version: '1.0.0',
  register: async function(server) {
    await server.cache.provision({
      provider: require('@hapi/catbox-memory'),
      name: 'stocks'
    });

    const _getData = async (payload: string) => {
      const tokens = payload.split('|');
      const url = `https://sandbox.iexapis.com/beta/stock/${tokens[0]}/chart/${
        tokens[1]
      }?token=Tpk_a98615abdab44ad2a6bc5b07b385505f`;
      console.log('calling url =', url);
      return await Wreck.get(url)
        .then(data => data.payload.toString())
        .catch(() => []);
    };

    const dataCache = server.cache({
      cache: 'stocks',
      expiresIn: 60 * 1000,
      segment: 'closing_prices',
      generateFunc: async (payload: string) => {
        console.log('Serving from Server as no cache found');
        return await _getData(payload);
      },
      generateTimeout: 10000
    });

    server.route({
      method: '*',
      path: '/api/beta/stock/{symbol}/chart/{period}',
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
      handler: async (request, reply) => {
        const payload = `${request.params.symbol}|${request.params.period}`;
        try {
          const response = await dataCache.get(payload);
          return reply.response(response);
        } catch (err) {
          return err;
        }
      }
    });
  }
};
