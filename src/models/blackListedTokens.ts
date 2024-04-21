import{ Schema, model, ObjectId, InferSchemaType, Document } from "mongoose";

interface IBlackListedToken extends Document {
    token: string;
    expiresAt: number;
}

const options = {
    timestamps: true
};

const blackListedTokenSchema = new Schema<IBlackListedToken>({
    token: {type: String, required: true},
    expiresAt: {type: Number, required: true}
}, options);

type BlackListedToken = InferSchemaType<typeof blackListedTokenSchema>;

//4. Create a model
const BlackListedTokenModel = model<IBlackListedToken>('BlackListedToken', blackListedTokenSchema);

export {
    BlackListedTokenModel,
    BlackListedToken
};