import { Document } from 'mongoose';

//몽구스 다큐먼트 extend 
export default interface IUser extends Document {
    username: string;
    password: string;
}
