import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const wixOrders = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    wix_order_id: {type:String,required:true},
    wix_order_number: {type:String,required:true},
    customerShipping_details: [
        {
            wix_customer_id: {type:String,required:true},
            fullname: {type:String,required:true},
            address1: {type:String,required:true},
            address2: {type:String},
            country: {type:String},
            zip_code: {type:String, required: true},
            state: {type:String},
            phone: {type:String},
            shipping_charges: {type:String},
            city: {type:String, required: true}
        }
    ],
    product_info:[
        {
            _id:mongoose.Schema.Types.ObjectId,
            wix_product_id: {type: String,required: true},
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
    customer_id: {type: String, required: true},
    total_weight: {type: String, required: true},
    total_quantity: {type: String,required: true},
    total_price: {type:String,required:true},
    total_tax: {type:String},
    shipping_charges: {type:String},
    shipment_ref_id: {type: String},
    shipment_ord_id: {type: String},
    shipment_status: {type: String},
    customer_email:{type:String,required:true,index:true},
    courier_id: {type: String},
    shiprocket_awb: {type:String},
    shiprocket_order: {type: Boolean, default: false},
    partner_status: {type: String}
},{ timestamps:true });

wixOrders.plugin(uniqueValidator)

export default mongoose.model('wix_orders',wixOrders);