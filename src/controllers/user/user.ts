import { UserModel } from '../../models/user.js';
import { BlackListedTokenModel, BlackListedToken } from '../../models/blackListedTokens.js';
import { Request, Response, NextFunction } from 'express';

function validateIncomingUser(req : any) : { p : string, u : string} {
    let u : any = req.user;
    let p : any = req.params;

    if (!p.id || (p._id && typeof p.id !== 'string')) {
        throw new Error('Invalid Request')
    };

    if (!u._id || (u._id && typeof u._id !== 'string')) {
        throw new Error('Invalid Request')
    };

    return { p: p.id, u: u._id };
};

async function checkToken(req: Request, res: Response, next: NextFunction) {
    const BLT : BlackListedToken | null = await BlackListedTokenModel.findOne({token: req.headers['authorization']?.split(' ')[1]})
    if (!BLT) next();
    res.redirect('/');
};
const getUser = async (req : Request, res: Response) => {
    try {
        const { p, u } = validateIncomingUser(req);

        let user : any | null = null;

        if (u === p) {
            //return the user their own data
            user = await UserModel.findById(p).select([
                'email',
                'username',
                '_id',
                'first_name',
                'last_name',
                'address',
                'birthday',
                'phone',
            ]);
        } else {
            user = await UserModel.findById(p).select([
                'username',
                'first_name',
                'last_name',
                'birthday'
            ]);
        };
        console.assert(user, "No user found");
        if (!user || user === null) throw new Error('Problem Retrieving User');

        res.status(200).send({user});
    } catch (e: unknown) {
        console.log(e)
        if (e instanceof Error) {
            if (e.message === 'Problem Retrieving User') {
                res.status(404).send(e.message);
            } else {
                res.status(400).send(e.message);
            };
        };
    };
};

const patchUser = async (req : Request, res: Response) => {
    try {
        if (req.headers['content-type'] !== 'application/json') throw new TypeError('Content Type Must Be application/json');
        const { p, u } = validateIncomingUser(req);

        if (p !== u ) throw new Error('Unauthorized Request');

        const keys : Array<string> = Object.keys(req.body);

        //fraud prevetion
        if (keys.length === 0 ||
            keys.length > 7 ||
            keys.includes('password') ||
            keys.includes('birthday') ||
            keys.includes('referrals') ||
            keys.includes('referred_by') ||
            keys.includes('tc') ||
            keys.includes('active') ||
            keys.includes('test') ||
            !keys.includes('latitude') ||
            !keys.includes('longitude') ||
            !keys.includes('timestamp')
        ) throw new Error('Invalid Request');

        //the only things they should be allowed to change through this route are 
        //email, phone, address, avatar, name
        let user : any | null = await UserModel.findById(p).select([
            'email', 
            'address', 
            'first_name', 
            'last_name',
            'avatar',
            'phone'
        ]);
        console.assert(user, "No user found");
        if (!user) throw new Error('Problem Retrieving User');

        for (const key of Object.keys(req.body)) {
            if (user[key]) {
                user[key] = req.body[key];
            };
        };
        await user.save();
        res.send(user);
    } catch(e: unknown) {
        console.log(e)
        if (e instanceof Error) {
            if (e.message === 'Problem Retrieving User') {
                res.status(404).send(e.message);
            } else if (e.message === 'Unauthorized Request'){
                res.status(401).send(e.message);
            } else {
                res.status(400).send(e.message);
            };
        };
    }
};

const deleteUser = (req : Request, res: Response) => {};

const deactivateUser = async (req : Request, res: Response) => {
    try {
        if (req.headers['content-type'] !== 'application/json') throw new TypeError('Content Type Must Be application/json');
        const { p, u } = validateIncomingUser(req);
        if (p !== u ) throw new Error('Unauthorized Request');

        let user : any | null = await UserModel.findById(p).select([
            'active',
            'refreshToken'
        ]);

        if (req.headers['Authorization'] || req.headers['authorization'] ) {
            const token = await new BlackListedTokenModel({ token: (<string>req?.headers['Authorization'])?.split(' ')[1] || (<string>req.headers['authorization']).split(' ')[1], expiresAt: Date.now() });
            token.save();
        };
        user.active = false;
        delete user.refreshToken;
        user.save();

        res.status(200).redirect('/');

    } catch(e: unknown) {
        if (e instanceof Error) {
            if (e.message === 'Problem Retrieving User') {
                res.status(404).send(e.message);
            } else if (e.message === 'Unauthorized Request'){
                res.status(401).send(e.message);
            } else {
                res.status(400).send(e.message);
            };
        };
    }

};

const reactivateUser = (req : Request, res: Response) => {};

export {
    getUser,
    patchUser,
    deactivateUser
}