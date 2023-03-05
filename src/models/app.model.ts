import { Schema, model, Document } from 'mongoose';

export interface IUrl extends Document {
    url: string;
    shortenedUrl: string;
    timesShortened?: number;
    timesAccessed?: number;
    user?: string;
}

const urlSchema = new Schema({
    url: { type: String, required: true },
    shortenedUrl: { type: String, required: true },
    timesShortened: { type: Number, required: false},
    timesAccessed: { type: Number, required: false},
    user: { type: String, required: false }
});


export interface IUser extends Document {
    email: string;
    password: string;
}

const userSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
});

export const UserModel = model<IUser>('User', userSchema);
export const UrlModel = model<IUrl>('URL', urlSchema);