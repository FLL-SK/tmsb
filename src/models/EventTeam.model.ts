import mongoose, { Schema, Document } from 'mongoose';

export namespace EventTeam {
    interface Type_noID {
        eventId: string; // reference to Event
        name: string; // teams name on that specific event
        arrived?: boolean;
        boysCount?: number;
        girlsCount?: number;
        results: {
            type: string;
            submitedOn: Date;
            submitedBy: string;
            score: number;
            details: string;
        }[];
    }

    export interface Type extends Type_noID {
        _id: string;
    }

    export interface Doc extends Document, Type_noID {}

    const _rschema: Schema = new Schema(
        {
            type: { type: String, required: true },
            submitedOn: { type: Date, required: true, default: new Date() },
            submitedBy: { type: String, ref: 'User', required: true },
            score: { type: Number, default: 0 },
            details: { type: String, default: '{}' },
        },
        { id: false, _id: false }
    );

    const _schema: Schema = new Schema({
        _id: { type: String, default: mongoose.Types.ObjectId().toHexString(), unique: true },
        eventId: { type: String, ref: 'Event' },
        name: { type: String, required: true },
        arrived: { type: Boolean },
        boysCount: { type: Number, default: 0 },
        girlsCount: { type: Number, default: 0 },
        results: [{ type: _rschema }],
    });

    export const Model = mongoose.model<Doc>('EventTeam', _schema);
}
