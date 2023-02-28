import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const customerShipmentSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    customer_id: {type: String, required: true},
    visitor_id: {type: String, required: true, unique: true},
    fullname: {type:String,required:true},
    address1: {type:String,required:true},
    address2: {type:String},
    country: {type:String},
    zip_code: {type:String, required: true},
    state: {type:String},
    state_code: {type:String},
    company: {type:String},
    phone: {type:String},
    shipping_charges: {type:String},
    city: {type:String, required: true}
},{ timestamps:true });

customerShipmentSchema.plugin(uniqueValidator);

export default mongoose.model("customer_shipping", customerShipmentSchema);