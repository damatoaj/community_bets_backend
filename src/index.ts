import express from 'express';
import type { Response, ErrorRequestHandler, Request, NextFunction } from 'express';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import cors from 'cors';
import './config/database.js';
import dotenv from "dotenv";
import passport from 'passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { UserModel } from './models/user.js';
import jwt from 'jsonwebtoken';

//Initialize Configurations
dotenv.config()


const app = express();
const port = process.env['APP_PORT'] || 8000;
const env = process.env['APP_ENV'] || 'dev';

// Construct the Strategy
const options: StrategyOptions = {
  secretOrKey: process.env.JWT_SECRET || 'DEVsdfamsfnbasnmfbsoqwer',
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

const findUser = async (jwt_payload:any, done:any) => {
  console.log('jwt: ', jwt_payload)
  const user = await UserModel.findOne({_id : jwt_payload._id});
  if (user) {
    return (done(null,user));
  }
  return done(null,false);
};





// initialize passport
// passport.initialize();

app.use(cors());
app.use(passport.initialize());

// Register the strategy so passport uses it when we call `passport.authenticate()` in our routes
passport.use(
  new Strategy(options, findUser)
);

app.get('/', (res: Response) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Welcome to Community Bets');
});


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', authRouter);
app.use('/', userRouter);

//Add this error handling middleware
app.use((error: ErrorRequestHandler, request: Request, response: Response, next: NextFunction) => {
  response.status(500).end()
})

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
