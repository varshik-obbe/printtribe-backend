import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const walletCustomerSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    customer_id: {type: String,required: true, unique: true, index: true},
    currency: {type:String,required:true},
    amount: {type:Number, required:true},
    status: {type:String,required:true}
}, {timestamps: true});

walletCustomerSchema.plugin(uniqueValidator);

export default mongoose.model("wallet", walletCustomerSchema)
