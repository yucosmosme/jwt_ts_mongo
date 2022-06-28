import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import logging from '../config/logging';
import User from '../models/user';
import signJWT from '../functions/signJTW';

const NAMESPACE = 'User';

//유효한지 확인
const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Token validated, user authorized.');

    return res.status(200).json({
        message: 'Token(s) validated'
    });
};

//회원 생성
const register = (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;

    //암호화하기
    //bcryptjs.hash( 아직 암호화되지 않은 비번, salt, (err,hash 콜백))
    bcryptjs.hash(password, 10, (hashError, hash) => {
        if (hashError) {
            return res.status(401).json({
                message: hashError.message,
                error: hashError
            });
        }

        //에러 없으면 db에 새로운 회원 넣기
        const _user = new User({
            _id: new mongoose.Types.ObjectId(),
            username,
            password: hash //bcrypt에서 암호화해준 비번
        });

        return _user
            .save()
            .then((user) => {
                return res.status(201).json({
                    user //생성된 유저 정보 반환 아래와 같음
                    /* "user": {
                       "_id": "~~~~",
                       "username" : "~~~" ,
                       "password":"암호화된pw",
                       "createdAt":"~~~",
                       "updatedAt":"~~~"
                     }*/
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    message: error.message,
                    error
                });
            });
    });
};

//로그인
//성공시 토큰이랑 유저정보 반환
const login = (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;

    //username으로 찾기
    User.find({ username })
        .exec()
        .then((users) => { //array로 반환
            if (users.length !== 1) { //여러명 반환하면 에러 반환 (db에서 unique로 셋팅했기때문에 여러명나올수없다)
                return res.status(401).json({
                    message: 'Unauthorized'
                });
            }

            //클라이언트에서 보낸 암호화되지않은 비번이랑 디비에 저장되어있는 암호화된 비번이랑 비교해줌
            bcryptjs.compare(password, users[0].password, (error, result) => {
                if (error) {
                    return res.status(401).json({
                        message: 'Password Mismatch'
                    });
                } else if (result) {
                    //로그인을 성공하면 토큰을 생성해서 반환해준다.
                    //->권한이 필요한 라우팅 접근시 그 토큰으로 인증하여 접근할수있게 해준다. 
                    //signJTW.ts에서 만든 함수에 유저정보 보내고 토큰 반환
                    signJWT(users[0], (_error, token) => {
                        if (_error) {
                            return res.status(500).json({
                                message: _error.message,
                                error: _error
                            });
                        } else if (token) {
                            return res.status(200).json({
                                message: 'Auth successful',
                                token: token,
                                user: users[0] //이거 다 반환해서 클라이언트에서 필요한거 쓸 수 있도록
                            });
                        }
                    });
                }
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

//회원들 반환. 비번은 안보이게.
const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    User.find()
        .select('-password') //비번은 제외하고 반환
        .exec()
        .then((users) => {
            return res.status(200).json({
                users: users,
                count: users.length
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
};

//위에 정의한 이름대로 반환
export default { validateToken, register, login, getAllUsers };
