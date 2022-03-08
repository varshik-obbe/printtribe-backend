import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const orderOfflineSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    customerShipping_details: [
        {
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
        }
    ],
    product_info:[
        {
            _id:mongoose.Schema.Types.ObjectId,
            product_id: {type: String,required: true},
            title: {type:String,required:true},
            description: {type:String},
            price: {type:String,required:true},
            productsize: {type: String},
            productcolor: {type: String},
            product_img: {type:String,required:true},
            category_id: {type:String,required:true},
            quantity: {type:String,required:true}
        }
    ],
    total_quantity: {type: String,required: true},
    total_price: {type:String,required:true},
    cgst1_amount: {type:String},
    sgst1_amount: {type: String},
    igst1_amount: {type: String},
    cgst2_amount: {type:String},
    sgst2_amount: {type: String},
    igst2_amount: {type: String},
    cgst3_amount: {type:String},
    sgst3_amount: {type: String},
    igst3_amount: {type: String},
    cgst4_amount: {type:String},
    sgst4_amount: {type: String},
    igst4_amount: {type: String},
    cgst5_amount: {type:String},
    sgst5_amount: {type: String},
    igst5_amount: {type: String},
    shipping_charges: {type:String},
    shipment_ref_id: {type: String},
    shipment_ord_id: {type: String},
    shipment_status: {type: String},
    customer_email:{type:String,required:true,index:true},
    courier_id: {type: String},
    shiprocket_awb: {type:String},
    shiprocket_order: {type: Boolean, default: false}
},{ timestamps:true });

orderOfflineSchema.plugin(uniqueValidator)

export default mongoose.model('orders_offline',orderOfflineSchema);