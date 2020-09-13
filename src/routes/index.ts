import { Application } from 'express';

module.exports = function setRoutes(app: Application) {
    app.use('/signup', require('./signup.route'));
    app.use('/login', require('./login.route'));
    app.use('/profile', require('./profile.route'));
    app.use('/event', require('./event.route'));
    app.use('/evtteam', require('./eventTeam.route'));
};
