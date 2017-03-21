'use strict';

const Stripe = require('stripe');
const joi = require('joi');
const pkg = require('./package.json');

const register = (server, option, done) => {
    const schema = joi.object({
        secretKey : joi.string().token().min(5).required()
    });
    const validation = schema.validate(Object.assign({}, option));
    if (validation.error) {
        done(validation.error);
    }
    const config = validation.value;
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
