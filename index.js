'use strict';

const Stripe = require('stripe');
const joi = require('joi');
const pkg = require('./package.json');

const register = (server, option, done) => {
    const { error, value : config } = joi.validate(Object.assign({}, option), {
        secretKey : joi.string().required().token().min(25).regex(/^sk_/)
    });
    if (error) {
        done(error);
        return;
    }
    const stripe = new Stripe(config.secretKey);
    server.decorate('request', 'stripe', stripe);
    done();
};

register.attributes = {
    pkg
};

module.exports = {
    register
};
