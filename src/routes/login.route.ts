import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

import { ENV } from '../lib/env';

const debugLib = require('debug')('login.route');
const logERR = require('debug')('ERROR:login.route');
const logWARN = require('debug')('WARN:login.route');

const router = express.Router();
module.exports = router;

router.post('/', function (req, res, next) {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        const debug = debugLib.extend('post/');
        debug('authenticating user=%O', user);

        if (err || !user) {
            debug('login failed for user=%O', user);
            return res.status(401).json({
                message: info ? info.message : 'Login failed',
                user: user,
            });
        }

        req.login(user, { session: false }, (err) => {
            debug('login OK');
            if (err) {
                res.send(err);
            }

            const token = jwt.sign(user, ENV.JWT_SECRET);

            res.cookie('refreshToken', token, { maxAge: 43200000, httpOnly: true }); // valid for 30 days
            return res.json({ user, token });
        });
    })(req, res);
});
