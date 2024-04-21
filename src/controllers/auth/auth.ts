import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User, UserModel } from '../../models/user.js';
import mongoose from 'mongoose';
import createUserToken   from '../../middleware/passport.js'
import crypto from 'crypto';
import { BlackListedTokenModel } from '../../models/blackListedTokens.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { WalletModel, Wallet } from '../../models/wallets.js';
import { Friends, FriendsModel } from '../../models/friends.js';
dotenv.config();

export interface IGetUserAuthInfoRequest extends Request {
    user: any
};

async function createUsername(first_name:string, last_name: string) {
    const countQuery = await UserModel.where({ first_name: first_name.toLocaleLowerCase(), last_name: last_name.toLowerCase() }).countDocuments();
    return `@${first_name.toLocaleLowerCase()}-${last_name.toLowerCase()}-${countQuery}`
};

function isValidPassword(password: string): boolean {
//https://stackoverflow.com/questions/25411819/regex-regular-expression-for-password-validation
//Minimum eight and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character:
    return /^(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=\D*\d)(?=[^!#%]*[!#%])[A-Za-z0-9!#%]{8,32}$/.test(password);
};

function isValidPhoneNumber(phoneNumber:string): boolean {
// 123-456-7890
// (123) 456-7890
// 123 456 7890
// 123.456.7890
// +91 (123) 456-7890
// 12334567890
    return /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phoneNumber)
};

function formatPhoneNumber(phoneNumber: string | number): number {
    if (typeof phoneNumber === 'number') {
        return phoneNumber
    } else {
        return parseInt(phoneNumber.split('').filter(i => /^[1-9]/.test(i)).join(''));
    };
};

function isValidName(name: string) : boolean {
    console.log('Name: ', name)
// abcdefghijklmnopqrstwxyz
//ABCDEFGHIJKLMNOPQRSTUVWXYZ
//áéíóúäëïöüÄ'
//陳大文
//łŁőŐűŰZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųū
//ÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁ
//ŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ.-
//ñÑâê都道府県Федерации
//আবাসযোগ্য জমির걸쳐 있는
// limit length between 2 and 32
    return /^[\w'\-,.][^0-9_!¡?÷?¿\/\\+=@#$%^&*(){}|~<>;:[\]]{1,32}$/.test(name)
}

function isValidBirthday(date:string) : boolean {
    if (date.length > 10) return false;
    let nums: Array<string> = date.split('-');

    if (nums.length !== 3) return false;

    let ints = nums.map((num:string)=> parseInt(num));
    if (ints[2] < 1 || ints[2] > 31) return false;
    if (ints[1] < 1 || ints[1] > 12) return false;
    if (ints[0] < 1900 || ints[0] > new Date(Date.now()).getFullYear() - 21) return false;

    return true
};

function isValidPostalCode(postalCode : number, countryCode :string) : boolean {
    switch (countryCode) {
        case "US":
            var postalCodeRegex = new RegExp(/^([0-9]{5})(?:[-\s]*([0-9]{4}))?$/);
             break;
        case "CA":
            var postalCodeRegex = new RegExp(/^([A-Z][0-9][A-Z])\s*([0-9][A-Z][0-9])$/);
            break;
        default:
            var postalCodeRegex = new RegExp(/^(?:[A-Z0-9]+([- ]?[A-Z0-9]+)*)?$/);
    }
    return postalCodeRegex.test(postalCode.toString());
}

function validateInputs(body: any) : boolean | Error{
    if (body.terms_and_conditions && body.terms_and_conditions !== true) throw new Error('Terms And Conditions Must Be Signed')
    if (body.password && body.confirm_password && (body.password !== body.confirm_password || !isValidPassword(body.password))) {
        throw new Error('Invalid Password');
    };

    if (body.email && body.confirm_email && (body.email !== body.confirm_email)) {
        throw new Error('Invalid Email');
    };

    if (body.state &&
        body.country && (
        body.state.length !== 2 || 
        body.country.length !== 2 ||
        typeof body.state !== 'string' ||
        typeof body.country !== 'string'
    )) {
        throw new Error('Invalid state or country code')
    };

    if (body.postal_code && !isValidPostalCode(body.postal_code, body.country)) {
        throw new Error('Invalid postal code');
    };

    if (body.birthday && !isValidBirthday(body.birthday)) {
        throw new Error('Invalid birthday');
    };

    if (body.first_name && (typeof body.first_name !== 'string' || !isValidName(body.first_name))) {
        throw new Error('Invalid First Name');
    };

    if (body.last_name && (typeof body.last_name !== 'string' || !isValidName(body.last_name))) {
        throw new Error('Invalid Last Name');
    };

    if (body.cell_phone && !isValidPhoneNumber(body.cell_phone)) {
        throw new Error('Invalid Phone Number')
    };

    return true;
};

const signup = async (req: Request, res: Response) => {
    try {
        if (req.headers['content-type'] !== 'application/json') {
            throw new TypeError('Content Type Must Be application/json')
        };

        const keys : Array<string> = Object.keys(req.body);

        if (!keys.includes('email') ||
            !keys.includes('confirm_email') ||
            !keys.includes('password') ||
            !keys.includes('confirm_password') ||
            !keys.includes('address_line_1') ||
            !keys.includes('city') ||
            !keys.includes('state') ||
            !keys.includes('country') ||
            !keys.includes('postal_code') ||
            !keys.includes('cell_phone') ||
            !keys.includes('birthday') || 
            !keys.includes('tc') ||
            !keys.includes('latitude') || 
            !keys.includes('longitude') || 
            !keys.includes('timestamp')
        ) {
            throw new Error('Missing Required Input');
        };

        validateInputs(req.body);

        const hash : string = await bcrypt.hash(req.body.password, 10);
        const ip : string = req.ip || '';

        const username : string = await createUsername(req.body.first_name, req.body.last_name);

        let user : User | null = await UserModel.findOne({email: req.body.email.toLowerCase().trim()});

        if (user) throw new Error("Email is already in use");
        //clean data
        user = await new UserModel({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email.toLowerCase().trim(),
            first_name:  req.body.first_name.toLowerCase().trim(),
            last_name:  req.body.last_name.toLowerCase().trim(),
            username: username,
            password: hash,
            address: {
                line_1: req.body.address_line_1.toLowerCase().trim(),
                line_2: req.body.address_line_2 ? req.body.address_line_2.trim() : '',
                city: req.body.city.toLowerCase().trim(),
                state: req.body.state.toUpperCase().trim(),
                country: req.body.country.toUpperCase().trim(),
                postal_code: req.body.postal_code
            },
            birthday: req.body.birthday,
            phone: formatPhoneNumber(req.body.cell_phone),
            referral_code: req.body.referral_code || null,
            ips: [ip],
            referrals: [],
            position: {
                lat: req.body.latitude,
                long: req.body.longitude,
                timestamp: req.body.timestamp,
            },
            test: true
        });

        if (!user) return res.status(409).send('User exists already');
        console.log(user);
        user.save();

        let wallet : Wallet | null = await new WalletModel({ 
            _id: new mongoose.Types.ObjectId(),
            userId : user._id, points: 0, 
            methods:[{title:'Manual'}] 
        });

        let friends : Friends | null = await new FriendsModel({
            _id: new mongoose.Types.ObjectId(),
            userId : user._id,
            friends: []
        });

        const token = await createUserToken(req, user, res);

        res.status(201).send({token, user: {
            _id: user._id,
            email: req.body.email,
            first_name:  req.body.first_name,
            last_name:  req.body.last_name,
            username,
            address_line_1: req.body.address_line_1,
            address_line_2: req.body.address_line_2 ? req.body.address_line_2 : null,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            birthday: req.body.birthday,
            cell_phone: formatPhoneNumber(req.body.cell_phone)
        }, wallet, friends
        });
    } catch (e : unknown) {
        if (e instanceof Error) {
            res.status(400).send(e.message);
        };
    };
};

const login = async (req: Request, res: Response) => {
    try {
        if (req.headers['content-type'] !== 'application/json') throw new TypeError('Content Type Must Be application/json');

        const keys : Array<string> = Object.keys(req.body);

        if (!keys.includes('email') ||
            !keys.includes('password') ||
            !keys.includes('latitude') ||
            !keys.includes('longitude') ||
            !keys.includes('timestamp') 
        ) throw new Error('Missing Required Input');

        validateInputs(req.body);

        const user : User | null = await UserModel.where({email : req.body.email.trim().toLowerCase()}).findOne();

        if (!user) throw new Error('Email And Password Do Not Match');
        
        const match : boolean= await bcrypt.compare(req.body.password.trim(), user.password)

        if (!match) throw new Error('Email And Password Do Not Match');

        if (user.active === false) throw new Error('Account Deactivated');
        
        const token : string = await createUserToken(req, user, res);

        res.status(201).send( {token });
    } catch (e: unknown) {
        if (e instanceof Error) {
            res.status(400).send(e.message);
        };
    };
};

const emailValidation = async (req: Request, res: Response) => {
    try {
        console.log(req);
        res.status(200).send('email validation success');

    } catch (e) {
        console.error('e');
    };
};

const logout = async (req: Request, res: Response) => {
    try {
        let u : any = req.user;

        if (!u.email) throw new Error('Invalid Request');

        const user : User | null = await UserModel.where({email : u.email.trim().toLowerCase()}).findOne();

        if (!user) throw new Error('Email And Password Do Not Match');

        if (req.headers['Authorization'] || req.headers['authorization'] ) {
            const token = await new BlackListedTokenModel({ token: (<string>req?.headers['Authorization'])?.split(' ')[1] || (<string>req.headers['authorization']).split(' ')[1], expiresAt: Date.now() });
            token.save();
        };

        delete user.refreshToken;
        user.save;
        res.status(200).redirect('/');

    } catch (e: unknown) {
        if (e instanceof Error) {
            res.status(400).send(e.message);
        };
    };
};


const resetPasswordRequest = async (req: Request, res: Response) => {
    try {
        console.log(req);
        res.status(200).send('password reset request success');
    } catch (e) {
        console.error('e');
    };
};


const resetPassword = async (req: Request, res: Response) => {
    try {
        console.log(req);
        res.status(200).send('reset password success');
    } catch (e) {
        console.error('e');
    };
};

const token = async (req: Request, res: Response) => {
    try {
        const refreshToken : string= (<string>req.headers['cookie'])

        jwt.verify(refreshToken.split('=')[1], process.env.REFRESH_TOKEN_SECRET || 'ljlkjadsnf.amnfkjjrljk');

        const accessToken = jwt.sign({
            _id: (req.user as User)._id,
        }, process.env.ACCESS_TOKEN_SECRET || 'DEVsdfamsfnbasnmfbsoqwer', {
            expiresIn: '5m'
        });

        res.status(201).send({accessToken});
    } catch (e) {
        if (e instanceof Error) {
            res.status(400).send(e.message);
        };
    };
};

export {
    signup,
    login,
    emailValidation,
    logout,
    resetPasswordRequest,
    resetPassword,
    token
}