import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const pickupSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    shiprocket_awb: {type:String,required:true, unique: true},
    description: {type:String},
    pickup_scheduled_date: {type:String},
    pickup_token_number: {type: String},
    status: {type: String},
    manifest_url: {type: String}
},{ timestamps:true });

pickupSchema.plugin(uniqueValidator);

export default mongoose.model("pickup_orders", pickupSchema);