import passport from 'passport';
import { ENV } from './env';
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { User } from '../models';
import { Application } from 'express';

const debugLib = require('debug')('lib/auth');
const logERR = require('debug')('ERROR:lib-auth');
const logWARN = require('debug')('WARN:lib-auth');
const logINFO = require('debug')('INFO:lib-auth');

module.exports = passportAuth;

function passportAuth(app: Application) {
    //Create a passport middleware to handle user registration
    passport.use(
        'signup',
        new localStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
            },
            async (email: string, password: string, done: any) => {
                try {
                    //Save the information provided by the user to the the database
                    const user = await User.Model.create({ email, password });
                    //Send the user information to the next middleware
                    return done(null, user);
                } catch (error) {
                    done(error);
                }
            }
        )
    );

    passport.use(
        'login',
        new localStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
            },
            async function (
                username: string,
                password: string,
                done: (err: Error | null, user?: any, info?: any) => any
            ) {
                const debug = debugLib.extend('login');
                debug('Authenticating using username=%s', username);
                try {
                    const user = await User.Model.findOne({ email: username }).exec();
                    if (!user || !user.isValidPassword(password)) {
                        debug('User not found or wrong password.');
                        return done(null, false);
                    }
                    debug('User logged in user=%O', user);
                    return done(null, { _id: user._id, username: user.email }, {});
                } catch (err) {
                    logERR('Error %O', err);
                    return done(err);
                }
            }
        )
    );

    passport.use(
        'jwt',
        new JWTstrategy(
            {
                jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
                secretOrKey: ENV.JWT_SECRET,
            },
            async function (payload: any, done: any) {
                const debug = debugLib.extend('jwt');
                try {
                    debug('Authenticating using JWT=%O', payload);
                    const u = await User.Model.findById(
                        payload._id,
                        { password: 0 },
                        { lean: true }
                    );

                    if (!u) return done(null, false);

                    debug('Authenticated OK');
                    return done(null, u);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    app.use(passport.initialize());
}
