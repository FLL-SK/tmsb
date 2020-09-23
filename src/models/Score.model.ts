import mongoose, { Schema, Document } from 'mongoose';

export namespace Score {
    interface Type_noID {
        eventTeamId: string; // reference to EventTeam
        rank?: number;
        coreValues?: number;
        project?: number;
        design?: number;
        game?: number;
        game1?: number; //
        game2?: number; //
        game3?: number; //
        gameQ?: number; // quarter-finals score
        gameS?: number; // semi-finals score
        gameF?: number; // finals score
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
            type: string; //R1, R2, R3, R1-PO, R2-PO, R3-PO, Q, Q-PO, S, S-PO, F, F-PO
            submitedOn?: Date;
            submitedBy?: string;
            score: number;
            missions: string; // details of completed missions
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

    export const schema: Schema = new Schema({
        _id: { type: String, default: mongoose.Types.ObjectId().toHexString(), unique: true },
        eventTeamId: { type: String, ref: 'EventTeam' },
        rank: { type: Number, default: 0 },
        coreValues: { type: Number },
        project: { type: Number },
        design: { type: Number },
        game: { type: Number },
        game1: { type: Number },
        game2: { type: Number },
        game3: { type: Number },
        gameQ: { type: Number },
        gameS: { type: Number },
        gameF: { type: Number },
        gameDetails: [{ type: _gameSchema }],
        judgingDetails: [{ type: _judgingSchema }],
    });

    export const Model = mongoose.model<Doc>('Score', schema);
}
