import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const tokenSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    token: {type:String,required:true},
    expiry_date: {type:String,required:true},
    name: {type:String,required:true,unique: true}
},{ timestamps:true });

tokenSchema.plugin(uniqueValidator);

export default mongoose.model("token", tokenSchema);