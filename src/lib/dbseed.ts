import mongoose from 'mongoose';
import { Promise as PromiseB } from 'bluebird';
import bcrypt from 'bcryptjs';

import { ENV } from '../lib/env';

import { Team, User, Event, EventTeam } from '../models';

const debugLib = require('debug')('lib/dbseed');
const logERR = require('debug')('ERROR:db-seed');
const logWARN = require('debug')('WARN:db-seed');
const logINFO = require('debug')('INFO:db-seed');

module.exports = function () {
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('init');
        try {
            await createAdmin('admin@admin.admin', 'admin');
            if (ENV.ENV.toLowerCase() !== 'dev') {
                debug('Not DEV environment - skipping seed');
                return fulfill(true);
            }
            debug('Creating seed data');
            const data = {};
            await deleteAll();
            await createAdmin('admin', 'admin');
            await seedUsers();
            await seedEvents();
            await seedEventTeams();
            debug('Seed complete');
            return fulfill(true);
        } catch (err) {
            logERR('SEED error err=%s', err.message);
            return reject(err);
        }
    });
};

async function deleteAll() {
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('deleteAll');

        await PromiseB.each(
            [
                { m: EventTeam.Model, t: 'EventTeam', q: {} },
                { m: Event.Model, t: 'Event', q: {} },
                { m: Team.Model, t: 'Team', q: {} },
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

function createAdmin(email: string, password: string) {
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('createAdmin');
        debug('Creating admin user');
        try {
            var u = await User.Model.findOne({ email });
            if (!u) {
                const s = await bcrypt.genSalt(1);
                const h = await bcrypt.hash(password, s);
                u = await User.Model.create({
                    password: h,
                    fullName: 'System admin',
                    isAdmin: true,
                    isSuperAdmin: true,
                    email: 'admin@admin.admin',
                });
                debug('Admin user created');
            } else {
                debug('Admin user already exists');
            }
            return fulfill(u);
        } catch (err) {
            logERR('Error creating Admin. %s', err.message);
            return reject(err);
        }
    });
}

function seedUsers() {
    const data = User.testData_Array();
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('seedUsers');
        debug('Seeding users');
        await PromiseB.each(data, async function (item, index) {
            try {
                await User.Model.create(item);
            } catch (err) {
                console.log('Error', err);
                reject(false);
            }
        });
        fulfill(true);
    });
}

function seedTeams() {
    const data = Team.testData_Array();
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('seedTeams');
        debug('Seeding teams');
        await PromiseB.each(data, async function (item, index) {
            try {
                await Team.Model.create(item);
            } catch (err) {
                console.log('Error', err);
                reject(false);
            }
        });
        fulfill(true);
    });
}

function seedEvents() {
    const data = Event.testData_Array(new Date());
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('seedEvents');
        debug('Seeding events');
        await PromiseB.each(data, async function (item, index) {
            try {
                await Event.Model.create(item);
            } catch (err) {
                console.log('Error', err);
                reject(false);
            }
        });
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
                        _id: e._id + ':' + i,
                        eventId: e._id,
                        name: 'Team ' + i + ' evt ' + e._id,
                        boysCount: b,
                        girlsCount: ts - b,
                        results: [],
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
