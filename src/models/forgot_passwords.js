import mongoose from "mongoose";

const forgotPasswordsSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    customer_email:{type:String, required: true},
    customer_id:{type:String,required:true,index: true},
    random_string: {type:String,required:true},
    expiry_date: {type:String,required:true}
},{ timestamps:true });

export default mongoose.model('forgot_password',forgotPasswordsSchema);