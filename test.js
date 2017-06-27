import test from 'ava';
import { Server } from 'hapi';
import zebra from '.';

const mockRoute = (option) => {
    return Object.assign(
        {
            method : 'POST',
            path   : '/',
            handler(request, reply) {
                reply({ foo : 'bar' });
            }
        },
        option
    );
};

const mockServer = async (option) => {
    const { plugin, route } = Object.assign(
        {
            plugin : {
                register : zebra,
                options  : {
                    secretKey : 'sk_someSuperSecretSneakyKey'
                }
            },
            route  : mockRoute()
        },
        option
    );
    const server = new Server();
    server.connection();
    if (plugin) {
        await server.register(plugin);
    }
    if (route) {
        server.route(route);
    }
    return server;
};

const mockRequest = (server, option) => {
    return server.inject(Object.assign(
        {
            method : 'POST',
            url    : '/'
        },
        option
    ));
};

test('without zebra', async (t) => {
    const server = await mockServer({
        plugin : null,
        route  : mockRoute({
            handler(request, reply) {
                t.false('stripe' in request);
                reply({ foo : 'bar' });
            }
        })
    });
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
    t.is(err.message, 'child "secretKey" fails because ["secretKey" is required]');
});

test('zebra basics', async (t) => {
    const server = await mockServer({
        route : mockRoute({
            handler(request, reply) {
                const { stripe } = request;
                t.truthy(stripe);
                t.is(typeof stripe, 'object');
                t.truthy(stripe.subscriptions);
                t.is(typeof stripe.subscriptions, 'object');
                t.is(typeof stripe.subscriptions.create, 'function');
                reply({ foo : 'bar' });
            }
        })
    });
    const response = await mockRequest(server);

    t.is(response.statusCode, 200);
    t.is(response.headers['content-type'], 'application/json; charset=utf-8');
    t.is(response.payload, '{"foo":"bar"}');
});
