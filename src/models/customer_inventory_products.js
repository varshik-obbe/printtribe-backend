import mongoose from "mongoose";


const customerIncentorySvhema = new mongoose.Schema({
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
    designID: {type: String, required: true},
    customer_id: {type: String, required: true},
    wix_product_id: {type: String},
    wix_inventory_id: {type: String},
    wix_variant_id: {type: String},
    shopify_prod: {type: String},
    shopify_prod_id: {type: String},
    shopify_inventory_id: {type: String},
    authorization_code: {type: String}
}, {timestamps: true});

export default mongoose.model("customer_inventory_products", customerIncentorySvhema)

