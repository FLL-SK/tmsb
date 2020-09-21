import mongoose, { Schema, Document } from 'mongoose';

export namespace EventSetup {
    interface Type_noID {
        eventId: string; // reference to Event
        rgType: string; // 'S' = preliminary->semifinals->finals, 'Q' = preliminary->quarterfinals->semifinals->finals
        rgPairs: { t1: string; t2: string }[]; // pairs for robot-game initial rounds
    }

    export interface Type extends Type_noID {
        _id?: string;
    }

    export interface Doc extends Document, Type_noID {}

    const _rgpSchema: Schema = new Schema(
        {
            t1: { type: String, ref: 'Event' },
            t2: { type: String, ref: 'Event' },
        },
        { id: false, _id: false }
    );

    const _schema: Schema = new Schema({
        _id: { type: String, default: mongoose.Types.ObjectId().toHexString(), unique: true },
        eventId: { type: String, ref: 'Event' },
        rgType: { type: String, default: 'S', required: true },
        rgPairs: [{ type: _rgpSchema }],
    });

    export const Model = mongoose.model<Doc>('EventSetup', _schema);
}
