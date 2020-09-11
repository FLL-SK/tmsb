import express, { Request } from 'express';
import passport from 'passport';

const debugLib = require('debug')('event.route');
const logERR = require('debug')('ERROR:event.route');
const logWARN = require('debug')('WARN:event.route');

import { Event } from '../models';
import { MongooseFilterQuery } from 'mongoose';

const router = express.Router();
module.exports = router;

interface RequestEvent extends Request {
    event?: Event.Doc;
    user?: any;
}

router.param('id', async function (req: RequestEvent, res, next) {
    const debug = debugLib.extend('param');
    const id = req.params.id;
    let u;
    try {
        u = await Event.Model.findById(id);
        if (!u) throw new Error('event not found');

        req.event = u;

        debug('Event=%s', req.event.name);
        next();
    } catch (err) {
        res.json({ error: err.message });
    }
});

router.get('/:id', passport.authenticate('jwt', { session: false }), function (
    req: RequestEvent,
    res,
    next
) {
    const debug = debugLib.extend('get/:id');
    res.json(req.event);
});

router.get('/', passport.authenticate('jwt', { session: false }), async function (
    req: RequestEvent,
    res,
    next
) {
    const debug = debugLib.extend('get/');
    const cmd = req.query.cmd;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const r = { result: 'error', status: 200, list: {} };
    debug('CMD=%s', cmd);

    switch (cmd) {
        case 'getList':
            {
                debug('Going to get list of events query=%O', req.query);
                const progId = req.query.program;
                const managerId = req.query.manager;
                const judgeId = req.query.judge;
                const refereeId = req.query.referee;

                let q: MongooseFilterQuery<Event.Doc> = { recordActive: true };
                if (progId) q.programId = progId;
                if (managerId) q.managers = managerId as string;
                if (judgeId) q.judges = judgeId as string;
                if (refereeId) q.referees = refereeId as string;

                if (!req.user.isAdmin) {
                    // admin will see all events - even past ones
                    //q.$or = [{ startDate: undefined }, { startDate: { $gte: today } }]; // start-date not specified or greater then today
                }
                debug('Query %O', q);
                const p = await Event.Model.find(q, {
                    _id: 1,
                    name: 1,
                    startDate: 1,
                });
                r.result = 'ok';
                r.list = p;
                debug('Result %O', p);
            }
            break;
    }
    res.json(r);
});
