import express, { Application, Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';

import favicon from 'serve-favicon'; // favicon
import logger from 'morgan'; // http logging
import path from 'path';
import cors from 'cors';

import { ENV } from './lib/env';
import { Auth } from './lib/auth';

import { seedDB } from './lib/dbseed';
import { connectDB } from './lib/db';

const logERR = require('debug')('ERROR:app');
const logWARN = require('debug')('WARN:app');

const app: Application = express();

// initialize mongoose models
require('./models');

app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
app.use(logger('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());

// configure passport authentication
Auth.configure(app);

// configure routes
require('./routes')(app);

//Handle errors
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    console.log('App error? here');
    res.status(err.status || 500);
    res.json({ error: err });
});

// initialize database connection
connectDB()
    .then(
        // initialize database + load seed data in DEV env
        () => seedDB()
    )
    .then(() =>
        // listen for requests
        app.listen(ENV.PORT, () => {
            console.log('Server started at', ENV.PORT);
        })
    );
