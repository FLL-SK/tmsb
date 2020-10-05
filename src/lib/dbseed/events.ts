import { Promise as PromiseB } from 'bluebird';
import add from 'date-fns/add';

const debugLib = require('debug')('lib/dbseed');
const logERR = require('debug')('ERROR:db-seed');
const logWARN = require('debug')('WARN:db-seed');
const logINFO = require('debug')('INFO:db-seed');

import { Event, User } from '../../models';

const eventData = [
    {
        offset: 0,
        name: 'KE01 Kosice now',
        program: 'FLL2020',
        rgType: 'S',
    },
    {
        offset: -365,
        name: 'KE02 Kosice las year',
        program: 'FLL2019',
        rgType: 'S',
    },
    {
        offset: 0,
        name: 'BA01 Bratislava now',
        program: 'FLL2020',
        rgType: 'S',
    },
    {
        offset: 1,
        name: 'BA02 Bratislava tomorrow',
        program: 'FLL2020',
        rgType: 'S',
    },
    {
        offset: -1,
        name: 'ZA01 Zilina yesterday',
        program: 'FLL2020',
        rgType: 'S',
    },
];

const eventData2 = [
    {
        managers: ['organizer01'],
        judges: ['judgeTW01', 'judgeIP01', 'judgeRD01'],
        referees: ['referee01', 'referee02'],
    },
    {
        managers: ['organizer01'],
        judges: ['judgeTW01', 'judgeIP01', 'judgeRD01'],
        referees: ['referee01', 'referee02'],
    },
    {
        managers: ['organizer02'],
        judges: ['judgeTW02', 'judgeIP02', 'judgeRD02'],
        referees: ['referee01', 'referee03'],
    },
    {
        managers: ['organizer02'],
        judges: ['judgeTW01', 'judgeIP01', 'judgeRD01'],
        referees: ['referee01', 'referee03'],
    },
    {
        managers: ['organizer02'],
        judges: ['judgeTW01', 'judgeIP01', 'judgeRD01'],
        referees: ['referee01', 'referee03'],
    },
];

export function seedEvents() {
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('seedEvents');
        debug('Seeding events');
        await PromiseB.each(eventData, async function (item, index) {
            try {
                debug('Event %s', item.name);
                let e = new Event.Model(item);
                if (item.offset) e.startDate = add(new Date(), { days: item.offset });
                for (let i of eventData2[index].managers) {
                    let u = await User.Model.findOne({ email: i + '@users.users' }).exec();
                    if (u) e.managers.push(u._id);
                }
                for (let i of eventData2[index].judges) {
                    let u = await User.Model.findOne({ email: i + '@users.users' }).exec();
                    if (u) e.judges.push(u._id);
                }
                for (let i of eventData2[index].referees) {
                    let u = await User.Model.findOne({ email: i + '@users.users' }).exec();
                    if (u) e.referees.push(u._id);
                }
                await e.save();
            } catch (err) {
                console.log('Error', err);
                reject(false);
            }
        });
        fulfill(true);
    });
}
