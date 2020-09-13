import express, { Request } from 'express';
import { Auth } from '../lib/auth';

const debugLib = require('debug')('profile.route');
const logERR = require('debug')('ERROR:profile.route');
const logWARN = require('debug')('WARN:profile.route');

import { User } from '../models';

const router = express.Router();
module.exports = router;

interface RequestProfile extends Request {
    profile?: User.Doc;
}

router.param('id', async function (req: RequestProfile, res, next) {
    const debug = debugLib.extend('param');
    const id = req.params.id;
    let u;
    try {
        u = await User.Model.findById(id, { password: 0 });
        if (!u) throw new Error('profile not found');

        req.profile = u;

        debug('Profile username=%s', req.profile.email);
        next();
    } catch (err) {
        res.json({ error: err.message });
    }
});

router.get('/:id', Auth.jwt(), function (req: RequestProfile, res, next) {
    const debug = debugLib.extend('get/:id');
    res.json(req.profile);
});
