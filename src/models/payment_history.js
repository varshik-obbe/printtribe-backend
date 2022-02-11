import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const paymentHistorySchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    customer_id: {type: String,required: true, index: true},
    currency: {type:String,required:true},
    amount: {type:Number, required:true},
    reference_id: {type: String},
    payment_order_id: {type: String, required:true},
    payment_id: {type: String},
    payment_date: {type: String, required: true},
    payment_status: {type: String}
}, {timestamps: true});

paymentHistorySchema.plugin(uniqueValidator);

export default mongoose.model("payment_history", paymentHistorySchema)
