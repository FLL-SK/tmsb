import mongoose, { Schema, Document } from 'mongoose';

export namespace EventTeam {
    interface Type_noID {
        eventId: string; // reference to Event
        name: string; // teams name on that specific event
        arrived?: boolean;
        coachName?: string;
        coachPhone?: string;
        boysCount?: number;
        girlsCount?: number;
    }

    export interface Type extends Type_noID {
        _id?: string;
    }

    export interface Doc extends Document, Type_noID {}

    const _schema: Schema = new Schema({
        _id: { type: String, default: mongoose.Types.ObjectId().toHexString(), unique: true },
        eventId: { type: String, ref: 'Event' },
        name: { type: String, required: true },
        arrived: { type: Boolean },
        coachName: { type: String },
        coachPhone: { type: String },
        boysCount: { type: Number, default: 0 },
        girlsCount: { type: Number, default: 0 },
    });

    export const Model = mongoose.model<Doc>('EventTeam', _schema);
}
