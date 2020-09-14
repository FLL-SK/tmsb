import express, { Request } from 'express';
import { Auth } from '../lib/auth';
import { resErr } from '../lib/res';

const debugLib = require('debug')('route.event');
const logERR = require('debug')('ERROR:route.event');
const logWARN = require('debug')('WARN:route.event');

import { Event, EventTeam } from '../models';
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
        return resErr(res, 404, err.message);
    }
});

router.get('/:id', Auth.jwt(), async function (req: RequestEvent, res, next) {
    const debug = debugLib.extend('get/:id');
    const cmd = req.query.cmd;

    if (!req.event) return res.status(500).json({ error: 'internal error event-route' });

    if (!cmd && req.event) {
        try {
            await req.event
                .populate('managers', 'fullName')
                .populate('judges', 'fullName')
                .populate('referees', 'fullName')
                .execPopulate();
            debug('Event=%O', req.event);
            return res.json(req.event);
        } catch (err) {
            return resErr(res, 500, err.message);
        }
    }

    switch (cmd) {
        case 'getTeams':
            try {
                const l = await EventTeam.Model.find({ eventId: req.event._id }).exec();
                return res.json(l);
            } catch (err) {
                logERR('Error getting teams for event %s', req.event._id);
                return resErr(res, 500, err.message);
            }
        default:
            return resErr(res, 404, 'wrong/missing cmd');
    }
});

router.get('/', Auth.jwt(), async function (req: RequestEvent, res, next) {
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
                try {
                    const p = await Event.Model.find(q, {
                        _id: 1,
                        name: 1,
                        startDate: 1,
                    });
                    debug('Result %O', p);
                    return res.json(p);
                } catch (err) {
                    logERR('Error getting events from db. err=%s', err.message);
                    resErr(res, 500, err.message);
                }
            }
            break;
        default:
            return resErr(res, 404, 'wrong/missing cmd');
    }
});
