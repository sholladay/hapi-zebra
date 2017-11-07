'use strict';

const Stripe = require('stripe');
const joi = require('joi');
const pkg = require('./package.json');

const register = (server, option, done) => {
    const { error, value : config } = joi.validate(option, joi.object().required().keys({
        secretKey : joi.string().required().token().min(25).regex(/^sk_/)
    }));
    if (error) {
        done(error);
        return;
    }
    server.decorate('server', 'stripe', new Stripe(config.secretKey));
    done();
};

register.attributes = {
    pkg
};

module.exports = {
    register
};
