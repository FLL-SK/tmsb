import express from 'express';
import { User } from '../models/User.model';

const debugLib = require('debug')('route.signup');
const logINFO = require('debug')('INFO:route.signup');
const logERR = require('debug')('ERROR:route.signup');
const logWARN = require('debug')('WARN:route.signup');

import { resErr } from '../lib/res';

import { sendSignupConfirmation } from '../lib/email';

const router = express.Router();
module.exports = router;

router.post('/', async (req, res, next) => {
    const debug = debugLib.extend('post/');
    const siteUrl = req.protocol + '://' + req.get('host');

    try {
        const u = await User.Model.findOne({ username: req.body.email, recordActive: true });

        if (u) resErr(res, 401, 'User does exist.');

        const nu: User.Type = {
            email: req.body.email,
            fullName: req.body.fullName,
            password: req.body.password,
        };

        debug('Going to create user: %O', nu);

        const user = await User.Model.create(nu);

        logINFO('User created: username=%s id=%s', user.email, user._id);
        sendSignupConfirmation(user, siteUrl);
        return res.json({ _id: user._id, email: user.email });
    } catch (err) {
        logERR('Signup failed %O', err);
        return resErr(res, 401, 'Signup failed', err.message);
    }
});
