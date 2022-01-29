import mongoose from "mongoose";

const customerShipmentSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    customer_id: {type: String, required: true},
    visitor_id: {type: String, required: true},
    fullname: {type:String,required:true},
    address1: {type:String,required:true},
    address2: {type:String},
    country: {type:String},
    zip_code: {type:String, required: true},
    state: {type:String},
    company: {type:String},
    phone: {type:String},
    shipping_charges: {type:String},
    city: {type:String, required: true}
},{ timestamps:true });

// categoriesSchema.plugin(uniqueValidator);

export default mongoose.model("customer_shipping", customerShipmentSchema);