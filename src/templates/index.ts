const debugLib = require('debug')('templates');
const logERR = require('debug')('ERROR:templates');
const logWARN = require('debug')('WARN:templates');
const logINFO = require('debug')('INFO:templates');

interface MsgParams {
    logoUrl: string;
    orgName: string;
    orgAddress: string;
    title: string;
    message: string;
    params?: [string, string][];
}

let;

export namespace TPL {
    export function genericMessage(prms: MsgParams) {
        const { logoUrl, orgName, orgAddress, title, message, params } = prms;
        const msg =
            "<div><div><img src=${LOGO} alt='Logo' width='80pt'/></div><div><h2>${ORGNAME}</h2><h4>${ORGADDRESS}</h4></div></div><div><h3>${TITLE}</h3><p>${MESSAGE}</p></div>";
        let p = [
            ...(params || []),
            ['LOGO', logoUrl],
            ['ORGNAME', orgName],
            ['ORGADDRESS', orgAddress],
            ['TITLE', title],
        ];
        let m = msg;
        m = m.replace(RegExp('${MESSAGE}', 'g'), message);
        for (let k of p) {
            m = m.replace(RegExp('${' + k[0] + '}', 'g'), k[1]);
        }
        m = m.replace(/\\n/g, '\n');
        return m;
    }

    export function signupConfirmation() {
        return genericMessage();
    }
}
