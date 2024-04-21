// Require
import dotenv from 'dotenv';
dotenv.config();
// const passport = require('passport');
import passport from 'passport';
// const Strategy = require('passport-jwt').Strategy;
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { UserModel, User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { BlackListedTokenModel } from '../models/blackListedTokens.js';

// Construct the Strategy
// const options: StrategyOptions = {
//   secretOrKey: process.env.JWT_SECRET || 'DEVsdfamsfnbasnmfbsoqwer',
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
// };

// const findUser = async (jwt_payload:any) => {
//     console.log(jwt_payload, '<--- jwt payload')
//     try {
//         return await UserModel.findById(jwt_payload.id)
//     } catch(err:unknown) {
//         return err
//     }
// };

// const strategy = new Strategy(options, findUser);

// Register the strategy so passport uses it when we call `passport.authenticate()` in our routes
// passport.use(strategy);

// initialize passport
// passport.initialize();

// write a function that creates a jwt token
const createUserToken = (req : Request, user: User, res: Response) => {
  if (!req.body.password) throw new Error('Invalid Credentials 🛑');
  // check the password from the req.body against the user
  const validPassword = bcrypt.compareSync(req.body.password, user.password);

  // if we didn't get a user or the password isn't valid, then trow an error
  if (!user || !validPassword) {
    const err = new Error('Invalid Credentials 🛑');
    // err.statusCode = 422;
    throw err
  } else { // otherwise create and sign a new token
    
    const accessToken : string = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET || 'DEVsdfamsfnbasnmfbsoqwer',
      { expiresIn: '5m'} // TODO: extend for production
    );

    const refreshToken : string = jwt.sign(
      {_id: user._id},
      process.env.REFRESH_TOKEN_SECRET || 'ljlkjadsnf.amnfkjjrljk',
      { expiresIn: '24h'}
    );
    
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'none', secure: true,
      maxAge: 24 * 60 * 60 * 1000
    });
    return accessToken;
  }
}

export default createUserToken
