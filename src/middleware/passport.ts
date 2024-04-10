// Require
import dotenv from 'dotenv';
dotenv.config();
// const passport = require('passport');
import passport from 'passport';
// const Strategy = require('passport-jwt').Strategy;
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { UserModel, User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import bcrypt from 'bcrypt';

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
const createUserToken = (req : Request, user: User) => {
    if (!req.body.password) throw new Error('Invalid Credentials 🛑');
  // check the password from the req.body against the user
  const validPassword = bcrypt.compareSync(req.body.password, user.password);

  // if we didn't get a user or the password isn't valid, then trow an error
  if (!user || !validPassword) {
    const err = new Error('Invalid Credentials 🛑');
    // err.statusCode = 422;
    throw err
  } else { // otherwise create and sign a new token
    return jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET || 'DEVsdfamsfnbasnmfbsoqwer',
      { expiresIn: '24h'} // TODO: extend for production
    );
  }
}

export default createUserToken
