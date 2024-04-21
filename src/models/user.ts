import{ Schema, model, ObjectId, InferSchemaType, Document } from "mongoose";
//Creating Mongoose database models requires up to five steps
//1. Define a typescript interface
interface IUser extends Document {
    _id: ObjectId;
    username:string; //formatted @first-last-number that they were created with that first last combo
    first_name: string;
    last_name: string;
    avatar?: string; //link this to a hosting platform
    email: string;
    birthday: string;
    password: string;
    phone: number;
    active: boolean;
    address : {
        line_1: string;
        line_2?: string;
        city: string;
        state: string;
        postal_code: number;
        country: string;
    },
    position: {
        lat: number;
        long: number;
    },
    referred_by?: string; //referrer's username
    referrals: [string]; //list of usernames
    test: boolean; //enbale test mode for development
    ips: [string];
    refreshToken?: string;
};

//2. Define options if applicable
const options = {
    timestamps: true
};

//3. create the Mongoose Schema
const userSchema = new Schema<IUser>({
    _id: {type: String, required: true },
    first_name: {type: String, required: true, lowercase: true, trim: true},
    last_name: {type: String, required: true, lowercase: true, trim: true},
    email: {type: String, required: true, lowercase: true, trim: true},
    password: {type: String, required: true, trim: true},
    username: {type: String, required: true, lowercase: true, trim: true},
    avatar: {type: String, required: false,  trim: true},
    birthday: {type: String, required: true},
    phone: {type: Number, required: true},
    referred_by: {type: String, required: false, trim: true},
    referrals: {type: [String], required: false},
    test: {type: Boolean, required: true, default: false},
    address: {
        line_1: {type: String, required: true, lowercase: true, trim: true},
        line_2: {type: String, required: false, lowercase: true, trim: true},
        city: {type: String, required: true, lowercase: true, trim: true},
        state: {type: String, required: true, uppercase: true, trim: true},
        postal_code: {type: Number, required: true},
        country: {type: String, required: true, uppercasecase: true, trim: true},
    },
    ips: {type: [String], required: true, trim: true},
    position: {
        lat: {type: Number, required: true},
        long:{type: Number, required: true},
        timestamp: {type: Number, required: true}
    },
    refreshToken: {type: String, required: false},
    active: {type:Boolean, required: true, default: true}
}, options);

type User = InferSchemaType<typeof userSchema>;

//4. Create a model
const UserModel = model<IUser>('User', userSchema);

export {
    UserModel,
    User
}