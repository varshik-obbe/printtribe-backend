import mongoose from "mongoose";


const productsSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    title: {type:String,required:true},
    description: {type:String,required:true,lowercase:true},
    price: {type:String,required:true,lowercase:true},
    productsizes: {type: Array},
    productcolors: {type: Array},
    cover_img: {type:String,required:true,lowercase:true},
    img: {type:String,required:true,lowercase:true},
    category_id: {type:String,required:true},
    quantity: {type:String,lowercase:true},
    extra_imgs: {type: Array},
    hsn_code: {type: String},
    gst: {type: String}
},{ timestamps:true });

// categoriesSchema.plugin(uniqueValidator);

export default mongoose.model("products", productsSchema);