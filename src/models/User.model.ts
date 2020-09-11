import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export namespace User {
    // internal type used only for creating Doc type below - _id was in conflict
    interface Type_noID {
        email: string;
        fullName?: string;
        password: string;
        recordActive?: boolean;
        isAdmin?: boolean;
        isSuperAdmin?: boolean;
    }

    interface Type extends Type_noID {
        _id: string;
    }

    export interface Doc extends Type_noID, Document {
        isValidPassword: (password: string) => boolean;
    }

    const _schema: Schema = new Schema({
        _id: { type: String, default: mongoose.Types.ObjectId().toHexString(), unique: true },
        email: { type: String, required: true, unique: true },
        fullName: { type: String },
        password: { type: String, required: true },
        recordActive: { type: Boolean, default: true },
        isAdmin: { type: Boolean },
        isSuperAdmin: { type: Boolean },
    });

    _schema.pre('save', async function (next) {
        //'this' refers to the current document about to be saved
        const user = this as Doc;
        //Hash the password with a salt round of 10, the higher the rounds the more secure, but the slower
        //your application becomes.
        const hash = await bcrypt.hash(user.password, 10);
        //Replace the plain text password with the hash and then store it
        user.password = hash;
        //Indicates we're done and moves on to the next middleware
        next();
    });

    _schema.methods.isValidPassword = async function (password: string) {
        const user = this;
        //Hashes the password sent by the user for login and checks if the hashed password stored in the
        //database matches the one sent. Returns true if it does else false.
        const compare = await bcrypt.compare(password, user.password);
        return compare;
    };

    export const Model = mongoose.model<Doc>('User', _schema);

    export function loremIpsum(name: string): Type {
        return {
            _id: name,
            email: name + '@users.users',
            fullName: 'FullName of ' + name,
            password: name,
        };
    }

    const list = [
        'coach01',
        'coach02',
        'coach03',
        'coach04',
        'coach05',
        'coach06',
        'coach07',
        'coach08',
        'coach09',
        'coach10',
        'coach11',
        'judgeTW01',
        'judgeTW02',
        'judgeIP01',
        'judgeIP02',
        'judgeRD01',
        'judgeRD02',
        'referee01',
        'referee02',
        'referee03',
        'organizer01',
        'organizer02',
    ];

    export function testData_Object(): { [key: string]: Type } {
        const data = list.reduce((o, key) => ({ ...o, [key]: loremIpsum(key) }), {});
        return data;
    }

    export function testData_Array(): Type[] {
        const data = list.map((i) => loremIpsum(i));
        return data;
    }
}
