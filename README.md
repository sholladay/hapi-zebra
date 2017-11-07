# hapi-zebra [![Build status for hapi-zebra on Circle CI.](https://img.shields.io/circleci/project/sholladay/hapi-zebra/master.svg "Circle Build Status")](https://circleci.com/gh/sholladay/hapi-zebra "Hapi Zebra Builds")

> Use [Stripe](https://stripe.com) in server routes

## Why?

 - Less verbose routes.
 - Centralized authentication.
 - Easy configuration.

## Install

```sh
npm install hapi-zebra --save
```

## Usage

Get it into your program.

```js
const zebra = require('hapi-zebra');
```

Register the plugin on your server.

```js
server.register({
    register : zebra,
    options  : {
        secretKey : process.env.STRIPE_SECRET_KEY
    }
})
    .then(() => {
        return server.start();
    })
    .then(() => {
        console.log(server.info.uri);
    });
```

Charge the user.

```js
server.route({
    method : 'POST',
    path   : '/user/charge',
    async handler(request, reply) {
        const { stripe } = request.server;

        await stripe.subscriptions.create({
            plan     : 'some-plan-name',
            customer : 'some-user-id',
            source   : request.payload.stripeToken
        });
        reply('Thanks for paying!');
    }
})
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

See our [contributing guidelines](https://github.com/sholladay/hapi-zebra/blob/master/CONTRIBUTING.md "The guidelines for participating in this project.") for more details.

1. [Fork it](https://github.com/sholladay/hapi-zebra/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/hapi-zebra/compare "Submit code to this project for review.").

## License

[MPL-2.0](https://github.com/sholladay/hapi-zebra/blob/master/LICENSE "The license for hapi-zebra.") © [Seth Holladay](http://seth-holladay.com "Author of hapi-zebra.")

Go make something, dang it.
