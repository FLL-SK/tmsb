import express, { Request } from 'express';
import { Auth } from '../lib/auth';
import { resErr } from '../lib/res';

const debugLib = require('debug')('route.event');
const logERR = require('debug')('ERROR:route.event');
const logWARN = require('debug')('WARN:route.event');

import { Event, EventTeam, Score, User } from '../models';
import mongoose, { MongooseFilterQuery, Types } from 'mongoose';

const router = express.Router();
module.exports = router;

interface RequestEvent extends Request {
    event?: Event.Doc | null;
    user?: User.TypeRequest;
}

function getRoles(
    user: User.TypeRequest | undefined | null,
    event: Event.Type | undefined | null,
    debug: any
) {
    if (user && event) {
        debug('Event managers %O', event.managers);
        if (event.managers.includes(user._id as Types.ObjectId)) user.isEventManager = true;
        if (event.judges.includes(user._id as Types.ObjectId)) user.isEventJudge = true;
        if (event.referees.includes(user._id as Types.ObjectId)) user.isEventReferee = true;
    }
}

async function populateEvent(event: Event.Doc) {
    return event
        .populate('managers', 'fullName')
        .populate('judges', 'fullName')
        .populate('referees', 'fullName')
        .populate('rgSchedule.t1', 'name')
        .populate('rgSchedule.t2', 'name')
        .execPopulate();
}

router.param('id', async function (req: RequestEvent, res, next) {
    const debug = debugLib.extend('param');
    const id = req.params.id;

    try {
        req.event = await Event.Model.findById(id).exec();
        if (!req.event) throw new Error('event not found');
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
    if (!req.user) return res.status(401).json({ error: 'not authorized' }); // for the sake of typescript

    getRoles(req.user, req.event, debug);

    if (!cmd && req.event) {
        try {
            await populateEvent(req.event);
            return res.json(req.event);
        } catch (err) {
            return resErr(res, 500, err.message);
        }
    }

    switch (cmd) {
        case 'getRanking':
            debug('Going to get ranking table for all teams event=%s', req.event.name);
            try {
                let t1 = await EventTeam.Model.find({ eventId: req.event._id })
                    .select({ _id: 1 })
                    .lean()
                    .exec();
                let t2: string[] = t1.map((t) => t._id); // map to simple array of ids
                debug('Teams=%O', t2);

                let ranking = await Score.Model.find({
                    eventTeamId: { $in: t2 },
                })
                    .lean()
                    .exec();
                debug('Ranking=%O', ranking);

                // if user is not judge, referee, event manager or admin, then do not show scores
                if (
                    !(
                        req.user.isAdmin ||
                        req.user.isEventManager ||
                        req.user.isEventJudge ||
                        req.user.isEventReferee
                    )
                ) {
                    ranking = ranking.map((i) => {
                        return {
                            ...i,
                            corevalues: undefined,
                            project: undefined,
                            design: undefined,
                            judgingDetails: [],
                            gameDetails: [],
                        };
                    });
                }
                return res.json(ranking);
            } catch (err) {
                logERR('Error getting ranking for event %s err=%s', req.event._id, err.message);
                return resErr(res, 500, err.message);
            }
            break;
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

router.post('/:id/fields', Auth.jwt(), async function (req: RequestEvent, res, next) {
    let debug = debugLib.extend('post/:id/fields');
    debug('/event/:ID/fields - post');

    getRoles(req.user, req.event, debug);

    debug('Body %O', req.body);
    debug('User %O', req.user);

    // no modifications allowed unless user is program manager or admin
    if (!req.user || (!req.user.isAdmin && !req.user.isEventManager)) {
        return resErr(res, 401, 'permission denied');
    }
    if (!req.event) return resErr(res, 404, 'event not found');

    try {
        for (let k in req.body) {
            // @ts-ignore - waiting for https://github.com/DefinitelyTyped/DefinitelyTyped/pull/48098
            let t = Event.schema.path(k).instance;

            switch (t) {
                case 'Number':
                case 'String':
                case 'Boolean':
                    req.event.set(k, req.body[k]);
                    break;
                case 'Array':
                    if (req.body[k]['$push'])
                        (req.event.get(k) as mongoose.Types.Array<any>).push(
                            req.event.get(k + '.$push')
                        );
                    if (req.body[k]['$pull'])
                        (req.event.get(k) as mongoose.Types.Array<any>).push(
                            req.event.get(k + '.$push')
                        );
                default:
                    throw new Error('Unhandled SchemaType=' + t);
            }
        }
        debug('Changed %O', req.event);
        await req.event.save();
    } catch (err) {
        logERR('POST fields err=%s', err.message);
        return resErr(res, 500, 'error updating field');
    }

    await populateEvent(req.event);
    res.json(req.event);
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

            let q: MongooseFilterQuery<Event.Doc> = { recordActive: true };
            if (req.query.program) q.programId = req.query.program;
            if (req.query.manager) q.managers = req.query.manager;
            if (req.query.judge) q.judges = req.query.judge;
            if (req.query.referee) q.referees = req.query.referee;

            debug('Query %O', q);
            try {
                const p = await Event.Model.find(q)
                    .select({ _id: 1, name: 1, startDate: 1 })
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
