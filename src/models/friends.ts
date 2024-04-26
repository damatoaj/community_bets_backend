import{ Schema, model, ObjectId, InferSchemaType, Document } from "mongoose";
//Creating Mongoose database models requires up to five steps
//1. Define a typescript interface
interface IF {
    friendId: ObjectId;
    status: 0 | 1 | 2 | 3 | 5; //Requested, Accepted, Rejected, Unfriended, Blocked
    username:string;
    avatar: string;
}

interface IFriends extends Document {
    _id: ObjectId;
    userId:ObjectId;
    friends: [IF]
};

//2. Define options if applicable
const options = {
    timestamps: false
};

//3. create the Mongoose Schema
const friendsSchema = new Schema<IFriends>({
    _id: {type: String, required: true },
    userId: {type: String, required: true},
    friends: {type: [], required: true}
}, options);

type Friends = InferSchemaType<typeof friendsSchema>;

//4. Create a model
const FriendsModel = model<IFriends>('Friends', friendsSchema);

export {
    FriendsModel,
    Friends,
    IF
}