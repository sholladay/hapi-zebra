import test from 'ava';
import hapi from '@hapi/hapi';
import zebra from '.';

const makeRoute = (option) => {
    return {
        method : 'GET',
        path   : '/',
        handler() {
            return 'Hello!';
        },
        ...option
    };
};

const makeServer = async (option) => {
    const { plugin } = {
        plugin : {
            plugin  : zebra,
            options : {
                secretKey : 'sk_someSuperSecretSneakyKey'
            }
        },
        ...option
    };
    const server = hapi.server();
    if (plugin) {
        await server.register(plugin);
    }
    return server;
};

test('without zebra', async (t) => {
    t.plan(6);
    const server = await makeServer({ plugin : null });
    server.route(makeRoute({
        handler(request) {
            t.false('stripe' in request.server);
            return { foo : 'bar' };
        }
    }));
    t.false('stripe' in server);
    const response = await server.inject('/');

    t.is(response.statusCode, 200);
    t.is(response.statusMessage, 'OK');
    t.is(response.headers['content-type'], 'application/json; charset=utf-8');
    t.is(response.payload, '{"foo":"bar"}');
});

test('zebra without secretKey', async (t) => {
    const error = await t.throwsAsync(makeServer({ plugin : zebra }));
    t.true(error.isJoi);
    t.is(error.message, '"secretKey" is required');
});

test('server can initialize', async (t) => {
    const server = await makeServer();
    await t.notThrowsAsync(server.initialize());
});

test('zebra basics', async (t) => {
    t.plan(11);
    const server = await makeServer();
    server.route(makeRoute({
        handler(request) {
            const { stripe } = request.server;
            t.truthy(stripe);
            t.is(typeof stripe, 'object');
            t.truthy(stripe.subscriptions);
            t.is(typeof stripe.subscriptions, 'object');
            t.is(typeof stripe.subscriptions.create, 'function');
            return { foo : 'bar' };
        }
    }));

    t.truthy(server.stripe);
    t.is(typeof server.stripe, 'object');

    const response = await server.inject('/');

    t.is(response.statusCode, 200);
    t.is(response.statusMessage, 'OK');
    t.is(response.headers['content-type'], 'application/json; charset=utf-8');
    t.is(response.payload, '{"foo":"bar"}');
});

test('sets API version', async (t) => {
    const server = await makeServer({
        plugin : {
            plugin  : zebra,
            options : {
                apiVersion : '2018-01-01',
                secretKey  : 'sk_someSuperSecretSneakyKey'
            }
        }
    });
    server.route(makeRoute());

    t.truthy(server.stripe);
    t.is(typeof server.stripe, 'object');
    t.is(server.stripe._api.version, '2018-01-01');

    const response = await server.inject('/');

    t.is(response.statusCode, 200);
    t.is(response.statusMessage, 'OK');
    t.is(response.headers['content-type'], 'text/html; charset=utf-8');
    t.is(response.payload, 'Hello!');
});
