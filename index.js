'use strict';

const Stripe = require('stripe');
const joi = require('joi');
const pkg = require('./package.json');

const register = (server, option) => {
    const config = joi.attempt(option, joi.object().required().keys({
        apiVersion : joi.string().optional().length(10).regex(/^\d{4}-\d{2}-\d{2}$/u),
        secretKey  : joi.string().required().token().min(25).regex(/^sk_/u)
    }));
    const stripe = new Stripe(config.secretKey);
    if (config.apiVersion) {
        stripe.setApiVersion(config.apiVersion);
    }
    server.decorate('server', 'stripe', stripe);
};

module.exports.plugin = {
    register,
    pkg
};
