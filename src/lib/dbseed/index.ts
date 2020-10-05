import { Promise as PromiseB } from 'bluebird';
import { Types } from 'mongoose';

import { ENV } from '../env';

import { User, Event, EventTeam } from '../../models';

const debugLib = require('debug')('lib/dbseed');
const logERR = require('debug')('ERROR:db-seed');
const logWARN = require('debug')('WARN:db-seed');
const logINFO = require('debug')('INFO:db-seed');

import { seedEvents } from './events';
import { createAdmin, seedUsers } from './users';

export function seedDB() {
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('init');
        try {
            await createAdmin('admin@admin.admin', 'admin');
            if (ENV.ENV.toLowerCase() !== 'dev') {
                logINFO('Not DEV environment - skipping seed');
                return fulfill(true);
            }
            logINFO('Seeding test data');
            const data = {};
            await deleteAll();
            await createAdmin('admin', 'admin');
            await seedUsers();
            await seedEvents();
            await seedEventTeams();
            await seedTeamRGSchedules();
            logINFO('Test data ready');
            return fulfill(true);
        } catch (err) {
            logERR('error err=%s', err.message);
            return reject(err);
        }
    });
}

async function deleteAll() {
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('deleteAll');

        await PromiseB.each(
            [
                { m: EventTeam.Model, t: 'EventTeam', q: {} },
                { m: Event.Model, t: 'Event', q: {} },
                { m: User.Model, t: 'User', q: {} },
            ],
            async function (item, index) {
                debug('Removing ' + item.t);
                try {
                    await item.m.remove({});
                } catch (err) {
                    console.log('Failed to drop %s err=$s', item.t, err.message);
                    reject(false);
                }
            }
        );
        fulfill(true);
    });
}

function seedEventTeams() {
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('seedEvtTeams');
        debug('Seeding teams for events');
        try {
            const ev = await Event.Model.find({}); // get all events
            for (const e of ev) {
                for (let i = 1; i < Math.floor(Math.random() * 5) + 6; i++) {
                    let ts = Math.floor(Math.random() * 10) + 1; // team size
                    let b = Math.floor(Math.random() * ts) + 1; // number of boys

                    const et: EventTeam.Type = {
                        eventId: e._id,
                        name: 'Team ' + i + ' evt ' + e.name.slice(0, 4),
                        coachName: 'Coach ' + i,
                        coachPhone: 'Coach Phone 555-' + i,
                        boysCount: b,
                        girlsCount: ts - b,
                    };
                    debug('Team= %s', et.name);
                    await EventTeam.Model.create(et);
                }
            }
        } catch (err) {
            console.log('Error creating EventTeam, err=', err.message);
            reject(false);
        }
        fulfill(true);
    });
}

interface _rgpair {
    round: number;
    table: string;
    t1: Types.ObjectId;
    t2: Types.ObjectId;
}
function createRGPairs(teams: Types.ObjectId[], tables: string[]): _rgpair[] {
    let pairs: _rgpair[] = [];
    for (let r = 1; r < 4; r++) {
        let t = 0;
        for (let t1 = 0; t1 < teams.length - 1; t1 += 2) {
            let p = { round: r, table: tables[t], t1: teams[t1], t2: teams[t1 + 1] };
            t++;
            if (t >= tables.length) t = 0;
            pairs.push(p);
        }
    }
    return pairs;
}

async function seedTeamRGSchedules() {
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('seedTeamRGSchedules');
        debug('Seeding RG Schedules');
        const evts = await Event.Model.find({}).exec();
        for (let e of evts) {
            const t = await EventTeam.Model.find({ eventId: e._id })
                .select({ _id: 1 })
                .lean()
                .exec();
            let s = createRGPairs(
                t.map((i) => i._id),
                ['Table1', 'Table2']
            );

            //e.rgSchedule.addToSet(s);
            s.forEach((i) => e.rgSchedule.push(i));
            e.save();
            debug('  Event %s pairs=%O', e.name, e.rgSchedule);
        }
        fulfill(true);
    });
}
