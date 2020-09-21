import { Promise as PromiseB } from 'bluebird';

const debugLib = require('debug')('lib/dbseed');
const logERR = require('debug')('ERROR:db-seed');
const logWARN = require('debug')('WARN:db-seed');
const logINFO = require('debug')('INFO:db-seed');

import { Event } from '../../models';

const eventData = [
    {
        _id: 'KE01',
        offset: 0,
        name: 'Kosice now',
        program: 'FLL2020',
        rgType: 'S',
    },
    {
        _id: 'KE02',
        offset: -365,
        name: 'Kosice las year',
        program: 'FLL2019',
        rgType: 'S',
    },
    {
        _id: 'BA01',
        offset: 0,
        name: 'Bratislava now',
        program: 'FLL2020',
        rgType: 'S',
    },
    {
        _id: 'BA02',
        offset: 1,
        name: 'Bratislava tomorrow',
        program: 'FLL2020',
        rgType: 'S',
    },
    {
        _id: 'ZA01',
        offset: -1,
        name: 'Zilina yesterday',
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
                let e = new Event.Model(item);
                eventData2[index].managers.forEach((i) => e.managers.push(i));
                eventData2[index].judges.forEach((i) => e.judges.push(i));
                eventData2[index].referees.forEach((i) => e.referees.push(i));
                await e.save();
            } catch (err) {
                console.log('Error', err);
                reject(false);
            }
        });
        fulfill(true);
    });
}
