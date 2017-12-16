'use strict';

const Stripe = require('stripe');
const joi = require('joi');
const pkg = require('./package.json');

const register = (server, option) => {
    const config = joi.attempt(option, joi.object().required().keys({
        secretKey : joi.string().required().token().min(25).regex(/^sk_/)
    }));
    server.decorate('server', 'stripe', new Stripe(config.secretKey));
};

module.exports.plugin = {
    register,
    pkg
};
