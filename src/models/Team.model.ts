import mongoose, { Schema, Document } from 'mongoose';

export namespace Team {
    interface Type_noID {
        name: string;
        recordActive?: boolean;
        orgName?: string;
        orgAddress?: string;
        orgAddress2?: string;
        orgTown?: string;
        orgPostCode?: string;
        coaches?: string[];
    }

    export interface Type extends Type_noID {
        _id: string;
    }

    export interface Doc extends Document, Type_noID {}

    const _schema: Schema = new Schema({
        _id: { type: String, default: mongoose.Types.ObjectId().toHexString(), unique: true },
        recordActive: { type: Boolean, default: true },
        name: { type: String, required: true, unique: true },
        orgName: { type: String },
        orgAddress: { type: String },
        orgAddress2: { type: String },
        orgTown: { type: String },
        orgPostCode: { type: String },
        coaches: [{ type: String, ref: 'User' }],
    });

    export const Model = mongoose.model<Doc>('Team', _schema);

    export function loremIpsum(num: string, idx?: number): Type {
        return {
            _id: 'team' + num,
            name: 'Team ' + num,
            orgName: 'School ' + num,
            orgAddress: 'Street ' + num,
            orgAddress2: idx ? (idx % 2 ? 'Street long ' + num : undefined) : undefined,
            orgTown: 'Town ' + num,
            orgPostCode: 'PSC ' + num,
            coaches: ['coach' + num],
        };
    }

    const list = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];

    export function testData_Object(): { [key: string]: Type } {
        const data = list.reduce((o, key) => ({ ...o, [key]: loremIpsum(key) }), {});
        return data;
    }

    export function testData_Array(): Type[] {
        const data = list.map((i) => loremIpsum(i));
        return data;
    }
}
