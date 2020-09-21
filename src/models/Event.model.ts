import mongoose, { Schema, Document, Types } from 'mongoose';

export namespace Event {
    interface _rgSchedule {
        round: number;
        t1: string;
        t2: string;
        table: string;
    }

    interface Type_noID {
        recordActive?: boolean;
        name: string;
        program: string; // program will determine used event screen e.g. FLL2020 will use different screen/scorer as FLL2019
        startDate: Date;
        managers: Types.Array<string>; // list of event managers
        referees: Types.Array<string>; // list of referees
        judges: Types.Array<string>; // lis of judges
        rgType: string; // 'S' = preliminary->semifinals->finals, 'Q' = preliminary->quarterfinals->semifinals->finals
        rgSchedule: Types.Array<_rgSchedule>; // pairs for robot-game initial rounds
    }

    export interface Type extends Type_noID {
        _id?: string;
    }

    export interface Doc extends Document, Type_noID {}

    const _rgpSchema: Schema = new Schema(
        {
            round: { type: Number, required: true },
            table: { type: String, required: true },
            t1: { type: String, ref: 'EventTeam' },
            t2: { type: String, ref: 'EventTeam' },
        },
        { id: false, _id: false }
    );

    const _schema: Schema = new Schema({
        _id: { type: String, default: mongoose.Types.ObjectId().toHexString(), unique: true },
        recordActive: { type: Boolean, default: true },
        name: { type: String, required: true, unique: true },
        program: { type: String },
        startDate: { type: Date },
        managers: [{ type: String, ref: 'User', default: [] }],
        referees: [{ type: String, ref: 'User', default: [] }],
        judges: [{ type: String, ref: 'User', default: [] }],
        rgType: { type: String, default: 'S', required: true },
        rgSchedule: [{ type: _rgpSchema, default: [], required: true }],
    });

    export const Model = mongoose.model<Doc>('Event', _schema);
}
