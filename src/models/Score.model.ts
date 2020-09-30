import mongoose, { Schema, Document } from 'mongoose';

export namespace Score {
    export interface JudgingDetails {
        type: string; // V, P, D
        room: string;
        submitedOn: Date;
        submitedBy: string;
        score: number;
        beginning: number;
        developing: number;
        accomplished: number;
        exceeds: number;
    }

    export interface GameDetails {
        round: string; //1, 2, 3, PO, Q, Q-PO, S, S-PO, F, F-PO
        table: string;
        submitedOn: Date;
        submitedBy: string;
        score: number;
        missions: string; // details of completed missions
    }

    interface Type_noID {
        eventTeamId: string; // reference to EventTeam
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
        judgingDetails: JudgingDetails[];
        gameDetails: GameDetails[];
    }

    export interface Type extends Type_noID {
        _id?: string;
    }

    export interface Doc extends Document, Type_noID {}

    export const judgingSchema: Schema = new Schema(
        {
            type: { type: String, required: true },
            room: { type: String, required: true },
            submitedOn: { type: Date, required: true, default: new Date() },
            submitedBy: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
            score: { type: Number, default: 0 },
            beginning: { type: Number, default: 0 },
            developing: { type: Number, default: 0 },
            accomplished: { type: Number, default: 0 },
            exceeds: { type: Number, default: 0 },
        },
        { id: false, _id: false }
    );

    export const gameSchema: Schema = new Schema(
        {
            round: { type: String, required: true },
            table: { type: String, required: true },
            submitedOn: { type: Date, required: true, default: new Date() },
            submitedBy: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
            score: { type: Number, default: 0 },
            missions: { type: String, default: '{}' },
        },
        { id: false, _id: false }
    );

    export const schema: Schema = new Schema({
        eventTeamId: { type: mongoose.Types.ObjectId, ref: 'EventTeam', required: true },
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
        gameDetails: [{ type: gameSchema }],
        judgingDetails: [{ type: judgingSchema }],
    });

    schema.pre('save', async function (next) {
        //'this' refers to the current document about to be saved
        const doc = this as Doc;

        doc.gameDetails.sort((a, b) => a.submitedOn.getTime() - b.submitedOn.getTime());

        for (let g of doc.gameDetails) {
            switch (g.round) {
                case '1':
                    doc.game1 = g.score;
                    break;
                case '2':
                    doc.game2 = g.score;
                    break;
                case '3':
                    doc.game3 = g.score;
                    break;
                case 'Q':
                    doc.gameQ = g.score;
                    break;
                case 'S':
                    doc.gameS = g.score;
                    break;
                case 'F':
                    doc.gameF = g.score;
                    break;
            }
        }
        doc.game = Math.max(doc.game1 || 0, doc.game2 || 0, doc.game3 || 0);

        doc.judgingDetails.sort((a, b) => a.submitedOn.getTime() - b.submitedOn.getTime());
        for (let g of doc.judgingDetails) {
            switch (g.type) {
                case 'V':
                    doc.coreValues = g.score;
                    break;
                case 'P':
                    doc.project = g.score;
                    break;
                case 'D':
                    doc.design = g.score;
                    break;
            }
        }

        next();
    });

    export const Model = mongoose.model<Doc>('Score', schema);
}
