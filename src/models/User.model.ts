import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export namespace User {
    // internal type used only for creating Doc type below - _id was in conflict
    interface Type_noID {
        email?: string;
        eventId?: Types.ObjectId; // special accounts of users created especially for specific event
        fullName?: string;
        password?: string;
        recordActive?: boolean;
        isAdmin?: boolean;
        isSuperAdmin?: boolean;
    }

    export interface Type extends Type_noID {
        _id?: Types.ObjectId;
    }

    export interface TypeRequest extends Type {
        isEventManager?: boolean; // not in database, set when managing event
        isEventJudge?: boolean; // not in database, set when managing event
        isEventReferee?: boolean; // not in database, set when managing event
        isTeamCoach?: boolean; // not in database, set when managing team
    }

    export interface Doc extends Type_noID, Document {
        isValidPassword: (password: string) => boolean;
    }

    export const schema: Schema = new Schema({
        email: { type: String, required: true, unique: true },
        fullName: { type: String },
        password: { type: String, required: true },
        recordActive: { type: Boolean, default: true },
        isAdmin: { type: Boolean },
        isSuperAdmin: { type: Boolean },
        eventId: { type: mongoose.Types.ObjectId, ref: 'Event' },
    });

    schema.pre('save', async function (next) {
        //'this' refers to the current document about to be saved
        const user = this as Doc;
        //Hash the password with a salt round of 10, the higher the rounds the more secure, but the slower
        //your application becomes.
        const hash = await bcrypt.hash(user.password || '', 10);
        //Replace the plain text password with the hash and then store it
        user.password = hash;
        //Indicates we're done and moves on to the next middleware
        next();
    });

    schema.methods.isValidPassword = async function (password: string) {
        const user = this;
        //Hashes the password sent by the user for login and checks if the hashed password stored in the
        //database matches the one sent. Returns true if it does else false.
        const compare = await bcrypt.compare(password, user.password);
        return compare;
    };

    export const Model = mongoose.model<Doc>('User', schema);
}
