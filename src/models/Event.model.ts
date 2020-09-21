import mongoose, { Schema, Document } from 'mongoose';

export namespace Event {
    interface Type_noID {
        recordActive?: boolean;
        name: string;
        program: string; // program will determine used event screen e.g. FLL2020 will use different screen/scorer as FLL2019
        startDate: Date;
        managers: string[];
        referees: string[];
        judges: string[];
    }

    export interface Type extends Type_noID {
        _id?: string;
    }

    export interface Doc extends Document, Type_noID {}

    const _schema: Schema = new Schema({
        _id: { type: String, default: mongoose.Types.ObjectId().toHexString(), unique: true },
        recordActive: { type: Boolean, default: true },
        name: { type: String, required: true, unique: true },
        program: { type: String },
        startDate: { type: Date },
        managers: [{ type: String, ref: 'User' }],
        referees: [{ type: String, ref: 'User' }],
        judges: [{ type: String, ref: 'User' }],
    });

    export const Model = mongoose.model<Doc>('Event', _schema);
}
