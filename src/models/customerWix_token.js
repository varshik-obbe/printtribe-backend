import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const wixtokenSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    customer_id: {type: String, required: true, unique: true},
    token: {type:String,required:true},
    expiry_date: {type:String,required:true},
    refresh_token: {type: String}
},{ timestamps:true });

wixtokenSchema.plugin(uniqueValidator);

export default mongoose.model("wix_token", wixtokenSchema);