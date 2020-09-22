import express, { Request } from 'express';
import { Auth } from '../lib/auth';
import { resErr } from '../lib/res';

const debugLib = require('debug')('route.event');
const logERR = require('debug')('ERROR:route.event');
const logWARN = require('debug')('WARN:route.event');

import { Event, EventTeam, User } from '../models';
import { MongooseFilterQuery, Types } from 'mongoose';

const router = express.Router();
module.exports = router;

interface RequestEvent extends Request {
    event?: Event.Doc | null;
    user?: User.TypeRequest;
}

router.param('id', async function (req: RequestEvent, res, next) {
    const debug = debugLib.extend('param');
    const id = req.params.id;
    try {
        req.event = await Event.Model.findById(id).exec();
        if (!req.event) throw new Error('event not found');

        if (req.user) {
            if (req.event.managers.includes(req.user._id as Types.ObjectId))
                req.user.isEventManager = true;
            if (req.event.judges.includes(req.user._id as Types.ObjectId))
                req.user.isEventJudge = true;
            if (req.event.referees.includes(req.user._id as Types.ObjectId))
                req.user.isEventReferee = true;
        }

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
                .populate('rgSchedule.t1', 'name')
                .populate('rgSchedule.t2', 'name')
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

            debug('Query %O', q);
            try {
                const p = await Event.Model.find(q)
                    .select({
                        _id: 1,
                        name: 1,
                        startDate: 1,
                    })
                    .exec();
                debug('Result %O', p);
                return res.json(p);
            } catch (err) {
                logERR('Error getting events from db. err=%s', err.message);
                resErr(res, 500, err.message);
            }

            break;

        default:
            return resErr(res, 404, 'wrong/missing cmd');
    }
});
