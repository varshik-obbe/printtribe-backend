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
    gst_details: [
        {
            gst_percent: {type:String,required:true},
            gst_amount: {type: String,required: true},
            gst_type: {type: String, required: true}
        }
    ],
    total_weight: {type: String},
    dimensions: {
        height: { type: String },
        width: { type: String },
        length: { type: String }
    },
    shipping_charges: {type:String},
    shipment_ref_id: {type: String},
    shipment_ord_id: {type: String},
    shipment_status: {type: String},
    customer_email:{type:String,required:true,index:true},
    courier_id: {type: String},
    shiprocket_awb: {type:String},
    shiprocket_order: {type: Boolean, default: false},
    pdf_link: {type: String}
},{ timestamps:true });

orderOfflineSchema.plugin(uniqueValidator)

export default mongoose.model('orders_offline',orderOfflineSchema);