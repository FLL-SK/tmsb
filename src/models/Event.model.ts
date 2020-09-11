import mongoose, { Schema, Document } from 'mongoose';

export namespace Event {
    interface Type_noID {
        recordActive?: boolean;
        name: string;
        program: string;
        startDate: Date;
        managers: string[];
        referees: string[];
        judges: string[];
    }

    export interface Type extends Type_noID {
        _id: string;
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

    const list = [
        {
            _id: 'KE01',
            offset: 0,
            name: 'Kosice now',
            program: 'FLL2020',
            managers: ['organizer01'],
            judges: ['judgeTW01', 'judgeIP01', 'judgeRD01'],
            referees: ['referee01', 'referee02'],
        },
        {
            _id: 'KE02',
            offset: -365,
            name: 'Kosice las year',
            program: 'FLL2019',
            managers: ['organizer01'],
            judges: ['judgeTW01', 'judgeIP01', 'judgeRD01'],
            referees: ['referee01', 'referee02'],
        },
        {
            _id: 'BA01',
            offset: 0,
            name: 'Bratislava now',
            program: 'FLL2020',
            managers: ['organizer02'],
            judges: ['judgeTW02', 'judgeIP02', 'judgeRD02'],
            referees: ['referee01', 'referee03'],
        },
        {
            _id: 'BA02',
            offset: 1,
            name: 'Bratislava tomorrow',
            program: 'FLL2020',
            managers: ['organizer02'],
            judges: ['judgeTW01', 'judgeIP01', 'judgeRD01'],
            referees: ['referee01', 'referee03'],
        },
        {
            _id: 'ZA01',
            offset: -1,
            name: 'Zilina yesterday',
            program: 'FLL2020',
            managers: ['organizer02'],
            judges: ['judgeTW01', 'judgeIP01', 'judgeRD01'],
            referees: ['referee01', 'referee03'],
        },
    ];

    export function testData_Object(d: Date): { [key: string]: Type } {
        const data = list.reduce(
            (o, item) => ({
                ...o,
                [item._id]: { ...item, startDate: new Date(d.getTime() + item.offset * 86400000) },
            }),
            {}
        );
        return data;
    }

    export function testData_Array(d: Date): Type[] {
        const data = list.map((i) => {
            return { ...i, startDate: new Date(d.getTime() + i.offset * 86400000) };
        });
        return data;
    }
}
