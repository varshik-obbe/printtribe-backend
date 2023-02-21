import mongoose from "mongoose";


const quantitySchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    product_id: {type:String,required:true, index: true},
    color: {type:String,required:true},
    color_code: {type:String},
    size: {type:String,required:true},
    user_id: {type:String,required:true},
    email: {type:String,required:true},
    updated_quant: {type:String,required:true},
    action: {type:String,lowercase:true},
    time: {type:String},
    remarks: {type: String},
    user_type: {type: String}
},{ timestamps:true });

// categoriesSchema.plugin(uniqueValidator);

export default mongoose.model("quantity_log", quantitySchema);