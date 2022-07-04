import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const orderSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    customerShipping_id:{type: String,required: true,lowecase:true,index:true,ref: "customer_shipping"},
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
            quantity: {type:String,required:true},
            zakeke_price: {type:String},
            designID: {type: String, required: true}
        }
    ],
    gst_details: [
        {
            gst_percent: {type:String},
            gst_amount: {type: String},
            gst_type: {type: String}
        }
    ],
    total_quantity: {type: String,required: true},
    total_price: {type:String,required:true},
    shipping_charges: {type:String,required:true},
    payment_type: {type: String, required: true, lowercase: true},
    payment_ref_id: {type: String},
    payment_status: {type: String},
    shipment_ref_id: {type: String},
    shipment_ord_id: {type: String},
    shipment_status: {type: String},
    customer_email:{type:String,required:true,index:true},
    customer_id: {type: String, required: true, index: true},
    courier_id: {type: String},
    visitor_id: {type:String,required:true,index:true},
    shiprocket_awb: {type:String}
},{ timestamps:true });

orderSchema.plugin(uniqueValidator)

export default mongoose.model('orders',orderSchema);