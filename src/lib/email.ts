import nodemailer from 'nodemailer';
import { Address } from 'nodemailer/lib/mailer';
import { Options as SMTPOptions } from 'nodemailer/lib/smtp-connection';
import { MailOptions } from 'nodemailer/lib/smtp-transport';
import pug from 'pug';

import { User } from '../models/User.model';

import {getFullTemplateName} from '../templates';

const debugLib = require('debug')('lib-email');
const logERR = require('debug')('ERROR:lib-email');
const logWARN = require('debug')('WARN:lib-email');
const logINFO = require('debug')('INFO:lib-email');

const exp = {};
module.exports = exp;

const smtpConfig: SMTPOptions = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_TLS == 'yes',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PWD,
    },
};

const emailConfig = {
    subjectPrefix: process.env.EMAIL_PREFIX ? process.env.EMAIL_PREFIX + ' ' : '',
};

if (process.env.ENV == 'development') emailConfig.subjectPrefix = '[DEV TEAMS] ';

export function sendPwdResetCode(user: User.Type, otc: string, url: string) {
    try {
        const template = pug.compileFile('views/emails/pwdResetCode.pug');

        let toEml = new Set<string>();
        if (user.email) toEml.add(user.email);

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            subject: emailConfig.subjectPrefix + 'Password reset requested by [' + user.email + ']',
            html: template({
                user: user,
                siteUrl: url,
                link: url + '/profile/' + user._id + '?cmd=resetPwd&otc=' + otc,
            }), // html body
        };

        sendEmail(mailOptions, toEml, 'password reset user=' + user.email);
    } catch (err) {
        logERR('Error sending password reset code. user=%s err=%s', user.email, err.message);
    }
}

export function sendSignupConfirmation(user: User.Type, url: string, locale:string='en-US') {
    try {
        const template = pug.compileFile(get'templates'views/emails/signup_confirm.pug');

        let toEml = new Set<string>();
        if (user.email) toEml.add(user.email);

        if (process.env.EMAIL_BCC_REGISTER) toEml.add(process.env.EMAIL_BCC_REGISTER);

        const mailOptions = {
            replyTo: process.env.EMAIL_BCC_REGISTER,
            from: process.env.EMAIL_FROM,
            subject: emailConfig.subjectPrefix + 'Account created [' + user.email + ']',
            html: template({ user: user, siteUrl: url }), // html body
        };

        sendEmail(mailOptions, toEml, 'account creation user=' + user.email);
    } catch (err) {
        logERR('Error sending confirmation. user=%s err=%s', user.email, err.message);
    }
}

export function sendMessage(
    user: User.Type,
    replyTo: string | Address,
    toEml: Set<string>,
    cSubject: string,
    title: string,
    msg: string,
    url: string
) {
    const debug = debugLib.extend('sendMessage');
    debug('EMAIL message ');
    try {
        const template = pug.compileFile('views/emails/message.pug');

        if (user.email) toEml.add(user.email);

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            replyTo: replyTo,
            subject: emailConfig.subjectPrefix + cSubject,
            html: template({ user: user, title: title, message: msg, siteUrl: url }), // html body
        };

        sendEmail(mailOptions, toEml, 'message');
    } catch (err) {
        logERR('Error sending message to email %s err=%s', user.email, err.message);
    }
}

export function sendEmail(mailOpts: MailOptions, toList: Set<string>, debugPrefix: string) {
    const debug = debugLib.extend('sendEmail');
    const transporter = nodemailer.createTransport(smtpConfig);
    var toListStr = '';
    toList.forEach((s) => (toListStr += s + ', '));
    debug('EMAIL: subject=%s to=%s', mailOpts.subject, toListStr);

    for (let eml of toList) {
        (function (opts) {
            transporter.sendMail(opts, function (error, info) {
                if (error) {
                    logWARN('EMAIL FAILED %s to %s err=%s', debugPrefix, opts.to, error.message);
                } else logINFO('EMAIL SENT %s to %s id=%s response=%s', debugPrefix, opts.to, info.messageId, info.response);
            });
        })({ ...mailOpts, to: eml });
    }
}
