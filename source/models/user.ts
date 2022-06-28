import mongoose, { Schema } from 'mongoose';
import IUser from '../interfaces/user';

//user model 생성
const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true }, //필수, 유니크
        password: { type: String, required: true }
    },
    {
        timestamps: true //타임스탬프 추가
    }
);

export default mongoose.model<IUser>('User', UserSchema);
