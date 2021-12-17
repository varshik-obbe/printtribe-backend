import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const vendorSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    companyname:{type:String, required: true},
    address1: {type:String, required: true},
    address2: {type: String},
    address3: {type: String},
    city: {type: String, required: true},
    state: {type: String, required: true},
    pincode: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String},
    website: {type: String},
    buisness_type: {type: String},
    gst: {type: String, required: true},
    pan: {type: String},
    account_number: {type: String},
    ifsc: {type: String},
    bank_name: {type: String}
},{ timestamps:true });


vendorSchema.plugin(uniqueValidator)

export default mongoose.model('Vendor',vendorSchema);