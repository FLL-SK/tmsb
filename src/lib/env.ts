// consolidate all env settings here

export namespace ENV {
    export const ENV = process.env.ENV || 'prod';
    export const PORT = process.env.PORT || 3000;

    export const JWT_SECRET = process.env.JWT_SECRET || '';
}

if (!ENV.JWT_SECRET || ENV.JWT_SECRET.length == 0) throw new Error('JWT Secret not defined');
