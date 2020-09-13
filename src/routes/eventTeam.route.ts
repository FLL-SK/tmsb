import express, { Request } from 'express';
import { Auth } from '../lib/auth';

const debugLib = require('debug')('evtTeam.route');
const logERR = require('debug')('ERROR:evtTeam.route');
const logWARN = require('debug')('WARN:evtTeam.route');

import { EventTeam } from '../models';
import { MongooseFilterQuery } from 'mongoose';

const router = express.Router();
module.exports = router;

interface RequestEventTeam extends Request {
    eventTeam?: EventTeam.Doc;
    user?: any;
}

router.param('id', async function (req: RequestEventTeam, res, next) {
    const debug = debugLib.extend('param');
    const id = req.params.id;
    let u;
    try {
        u = await EventTeam.Model.findById(id);
        if (!u) throw new Error('event not found');

        req.eventTeam = u;

        debug('EventTeam=%s', req.eventTeam.name);
        next();
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
});

router.get('/:id', Auth.jwt(), function (req: RequestEventTeam, res, next) {
    const debug = debugLib.extend('get/:id');
    const cmd = req.query.cmd;
    if (!cmd) res.json(req.eventTeam);
    switch (cmd) {
        default:
            return res.status(404).json({ error: 'wrong/missing cmd' });
    }
});

router.get('/', Auth.jwt(), function (req: RequestEventTeam, res, next) {
    const debug = debugLib.extend('get/');
    const cmd = req.query.cmd;
    switch (cmd) {
        case 'getTeams':
            const evt = req.query.event;

            break;
        default:
            return res.status(404).json({ error: 'wrong/missing cmd' });
    }
});
