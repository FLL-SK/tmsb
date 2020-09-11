import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');

const debugLib = require('debug')('lib-db');
const logERR = require('debug')('ERROR:lib-db');
const logWARN = require('debug')('WARN:lib-db');
const logINFO = require('debug')('INFO:lib-db');

const url =
    'mongodb://' +
    (process.env.DB_USER ? process.env.DB_USER + ':' + process.env.DB_PWD + '@' : '') +
    process.env.DB_SERVER +
    '/' +
    process.env.DB_DATABASE;

module.exports = function () {
    return new Promise(async function (fulfill, reject) {
        const debug = debugLib.extend('init');
        try {
            mongoose.set('useCreateIndex', true);
            mongoose.connection.on('error', function (err) {
                console.error.bind(console, 'connection error:');
                logERR('Database connection failed. err=%s', err.message);
            });

            mongoose.connection.once('open', function () {
                logINFO(
                    'Connected successfully to database @' +
                        process.env.DB_SERVER +
                        '/' +
                        process.env.DB_DATABASE
                );
            });

            debug('Connecting to ' + url);
            mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

            //conn = mongoose.connection;

            return fulfill(true);
        } catch (err) {
            return reject(err);
        }
    });
};
