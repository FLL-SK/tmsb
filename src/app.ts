import express, { Application, Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';

import favicon from 'serve-favicon'; // favicon
import logger from 'morgan'; // http logging
import path from 'path';
import cors from 'cors';

import { ENV } from './lib/env';

const logERR = require('debug')('ERROR:app');
const logWARN = require('debug')('WARN:app');

const app: Application = express();

// initialize database connection
require('./lib/db')();

// initialize mongoose models
require('./models');

// initialize database + load seed data in DEV env
require('./lib/dbseed')();

app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
app.use(logger('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());

// configure passport authentication
require('./lib/auth')(app);

// configure routes
require('./routes')(app);

//Handle errors
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    console.log('App error? here');
    res.status(err.status || 500);
    res.json({ error: err });
});

app.listen(ENV.PORT, () => {
    console.log('Server started at', ENV.PORT);
});
