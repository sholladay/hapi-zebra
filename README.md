# hapi-zebra [![Build status for hapi Zebra](https://img.shields.io/circleci/project/sholladay/hapi-zebra/master.svg "Build Status")](https://circleci.com/gh/sholladay/hapi-zebra "Builds")

> Use [Stripe](https://stripe.com) in server routes

## Why?

 - Simplifies configuration.
 - Ensures needed API keys are available.
 - Less verbose routes.

## Install

```sh
npm install hapi-zebra --save
```

## Usage

Register the plugin on your server to make the `stripe` library available in routes.

```js
const hapi = require('hapi');
const zebra = require('hapi-zebra');

const server = hapi.server();

const init = async () => {
    await server.register({
        plugin  : zebra,
        options : {
            secretKey : process.env.STRIPE_SECRET_KEY
        }
    });
    server.route({
        method : 'POST',
        path   : '/charge',
        async handler(request) {
            const { stripe } = request.server;

            await stripe.subscriptions.create({
                plan     : 'some-plan-name',
                customer : 'some-user-id',
                source   : request.payload.stripeToken
            });
            return 'Thanks for paying!';
        }
    });
    await server.start();
    console.log('Server ready:', server.info.uri);
};

init();
```

## API

Please see Stripe's [API documentation](https://stripe.com/docs/api/node) for details on the `stripe` library itself.

### option

Type: `object`

Plugin settings.

#### secretKey

Type: `string`

Your secret [Stripe API key](https://stripe.com/docs/dashboard#api-keys), used to authenticate with Stripe when using its API.

## Contributing

See our [contributing guidelines](https://github.com/sholladay/hapi-zebra/blob/master/CONTRIBUTING.md "Guidelines for participating in this project") for more details.

1. [Fork it](https://github.com/sholladay/hapi-zebra/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/hapi-zebra/compare "Submit code to this project for review").

## License

[MPL-2.0](https://github.com/sholladay/hapi-zebra/blob/master/LICENSE "License for hapi-zebra") © [Seth Holladay](https://seth-holladay.com "Author of hapi-zebra")

Go make something, dang it.
