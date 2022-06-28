import jwt from 'jsonwebtoken';
import config from '../config/config';
import logging from '../config/logging';
import { Request, Response, NextFunction } from 'express';

const NAMESPACE = 'Auth';

//req, res, next 파라미터를 express제공 형식으로 받아옴
const extractJWT = (req: Request, res: Response, next: NextFunction) => {
    //로그
    logging.info(NAMESPACE, 'Validating token');

    //token은 bearer token으로서, bearer과 token이 space로 구분되어 있어서 split해서 token만 취함. 이렇게 보통 많이함.
    //여기서 토큰은 로그인시 생성하여 클라이언트에 반환한 것으로,
    //권한이 필요한 라우팅에서 클라이언트에서 header에 넣어서 보내서 아래와 같이 verify과정을 거쳐서 맞으면 허용해주는 것
    let token = req.headers.authorization?.split(' ')[1];

    if (token) {
        //config.jts 파일에서 정의한 토큰 암호화/해독에 필요한 secret
        //디코드해서 맞는지 확인
        jwt.verify(token, config.server.token.secret, (error, decoded) => {
            if (error) {
                return res.status(404).json({
                    message: error,
                    error
                });
            } else {
                res.locals.jwt = decoded; //디코드된거 res.locals에 저장
                next(); //그 다음 함수 호출
            }
        });
    } else {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }
};

export default extractJWT;
