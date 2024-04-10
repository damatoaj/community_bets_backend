import { User, UserModel } from '../../models/user.js';
import mongoose from 'mongoose';
import { Request, Response } from 'express';

const getUser = (req : Request, res: Response) => {
    console.log('get user controller hit')
    console.log(req)
    res.send('complete')
};

const patchUser = (req : Request, res: Response) => {};

const deleteUser = (req : Request, res: Response) => {};

const deactivateUser = (req : Request, res: Response) => {};

const reactivateUser = (req : Request, res: Response) => {};

export {
    getUser
}