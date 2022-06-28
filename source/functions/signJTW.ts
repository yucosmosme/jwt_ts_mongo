import jwt from 'jsonwebtoken';
import config from '../config/config';
import logging from '../config/logging';
import IUser from '../interfaces/user';

const NAMESPACE = 'Auth';

//로그인하면 토큰 생성하고 리턴해줌.-> 제한된 라우팅 접근을 할 때 이 토큰으로 인증하여 접근
const signJWT = (user: IUser, callback: (error: Error | null, token: string | null) => void): void => {
    var timeSinceEpoch = new Date().getTime();
    //아래 number는 분단위
    var expirationTime = timeSinceEpoch + Number(config.server.token.expireTime) * 100000;
    //초단위로 만들어줌
    var expirationTimeInSeconds = Math.floor(expirationTime / 1000);

    logging.info(NAMESPACE, `Attempting to sign token for ${user._id}`);

    try {
        jwt.sign(
            {
                username: user.username //여기에는 토큰 적용이 필요한 중요 정보들을 페이로드로 넣음
            },
            config.server.token.secret,
            {
                issuer: config.server.token.issuer,
                algorithm: 'HS256',
                expiresIn: expirationTimeInSeconds
            },
            (error, token) => {//콜백
                if (error) {
                    callback(error, null);
                } else if (token) {
                    callback(null, token);
                }
            }
        );
    } catch (error) {
        logging.error(NAMESPACE, error.message, error);
        callback(error, null); //문제 발생시
    }
};

export default signJWT;
