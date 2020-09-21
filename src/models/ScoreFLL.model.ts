import mongoose, { Schema, Document } from 'mongoose';

export namespace ScoreFLL {
    interface Type_noID {
        eventTeamId: string; // reference to EventTeam
        coreValues?: number;
        project?: number;
        design?: number;
        game?: number;
        judgingDetails: {
            type: string;
            submitedOn?: Date;
            submitedBy?: string;
            score: number;
            one: number;
            two: number;
            three: number;
            four: number;
        }[];
        gameDetails: {
            type: string;
            submitedOn?: Date;
            submitedBy?: string;
            score: number;
            missions: string;
        }[];
    }

    export interface Type extends Type_noID {
        _id?: string;
    }

    export interface Doc extends Document, Type_noID {}

    const _judgingSchema: Schema = new Schema(
        {
            type: { type: String, required: true },
            submitedOn: { type: Date, required: true, default: new Date() },
            submitedBy: { type: String, ref: 'User', required: true },
            score: { type: Number, default: 0 },
            one: { type: Number, default: 0 },
            two: { type: Number, default: 0 },
            three: { type: Number, default: 0 },
            four: { type: Number, default: 0 },
        },
        { id: false, _id: false }
    );

    const _gameSchema: Schema = new Schema(
        {
            type: { type: String, required: true },
            submitedOn: { type: Date, required: true, default: new Date() },
            submitedBy: { type: String, ref: 'User', required: true },
            score: { type: Number, default: 0 },
            missions: { type: String, default: '{}' },
        },
        { id: false, _id: false }
    );

    const _schema: Schema = new Schema({
        _id: { type: String, default: mongoose.Types.ObjectId().toHexString(), unique: true },
        eventTeamId: { type: String, ref: 'EventTeam' },
        coreValues: { type: Number },
        project: { type: Number },
        design: { type: Number },
        game: { type: Number },
        gameDetails: [{ type: _gameSchema }],
        judgingDetails: [{ type: _judgingSchema }],
    });

    export const Model = mongoose.model<Doc>('ScoreFLL', _schema);
}
