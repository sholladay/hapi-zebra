import test from 'ava';
import hapi from 'hapi';
import stripAnsi from 'strip-ansi';
import zebra from '.';

const mockRoute = (option) => {
    return {
        method : 'POST',
        path   : '/',
        handler() {
            return { foo : 'bar' };
        },
        ...option
    };
};

const mockServer = async (option) => {
    const { plugin, route } = {
        plugin : {
            plugin   : zebra,
            options  : {
                secretKey : 'sk_someSuperSecretSneakyKey'
            }
        },
        route  : mockRoute(),
        ...option
    };
    const server = hapi.server();
    if (plugin) {
        await server.register(plugin);
    }
    if (route) {
        server.route(route);
    }
    return server;
};

const mockRequest = (server, option) => {
    return server.inject({
        method : 'POST',
        url    : '/',
        ...option
    });
};

test('without zebra', async (t) => {
    const server = await mockServer({
        plugin : null,
        route  : mockRoute({
            handler(request) {
                t.false('stripe' in request.server);
                return { foo : 'bar' };
            }
        })
    });
    t.false('stripe' in server);
    const response = await mockRequest(server);

    t.is(response.statusCode, 200);
    t.is(response.headers['content-type'], 'application/json; charset=utf-8');
    t.is(response.payload, '{"foo":"bar"}');
});

test('zebra without secretKey', async (t) => {
    const err = await t.throws(mockServer({
        plugin : zebra
    }));
    t.true(err.isJoi);
    t.is(stripAnsi(err.message), '{\n  "secretKey" [1]: -- missing --\n}\n\n[1] "secretKey" is required');
});

test('zebra basics', async (t) => {
    const server = await mockServer({
        route : mockRoute({
            handler(request) {
                const { stripe } = request.server;
                t.truthy(stripe);
                t.is(typeof stripe, 'object');
                t.truthy(stripe.subscriptions);
                t.is(typeof stripe.subscriptions, 'object');
                t.is(typeof stripe.subscriptions.create, 'function');
                return { foo : 'bar' };
            }
        })
    });

    t.truthy(server.stripe);
    t.is(typeof server.stripe, 'object');

    const response = await mockRequest(server);

    t.is(response.statusCode, 200);
    t.is(response.headers['content-type'], 'application/json; charset=utf-8');
    t.is(response.payload, '{"foo":"bar"}');
});
