import { Promise as PromiseB } from 'bluebird';
import bcrypt from 'bcryptjs';

const debugLib = require('debug')('lib/dbseed');
const logERR = require('debug')('ERROR:db-seed');
const logWARN = require('debug')('WARN:db-seed');
const logINFO = require('debug')('INFO:db-seed');

import { User } from '../../models';

export function createAdmin(email: string, password: string) {
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

const userData = [
    'coach01',
    'coach02',
    'coach03',
    'coach04',
    'coach05',
    'coach06',
    'coach07',
    'coach08',
    'coach09',
    'coach10',
    'coach11',
    'judgeTW01',
    'judgeTW02',
    'judgeIP01',
    'judgeIP02',
    'judgeRD01',
    'judgeRD02',
    'referee01',
    'referee02',
    'referee03',
    'organizer01',
    'organizer02',
];

export function seedUsers() {
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('seedUsers');
        debug('Seeding users');
        await PromiseB.each(userData, async function (name, index) {
            try {
                let u = new User.Model({
                    email: name + '@users.users',
                    fullName: 'FullName of ' + name,
                    password: name,
                });

                await u.save();
            } catch (err) {
                console.log('Error', err);
                reject(false);
            }
        });
        fulfill(true);
    });
}
