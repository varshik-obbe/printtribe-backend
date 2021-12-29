import mongoose from "mongoose";


const paymentMethodSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    name: {type:String,required:true},
    status: {type:String,required:true,lowercase:true},
    logo: {type:String,required:true}
},{ timestamps:true });

// categoriesSchema.plugin(uniqueValidator);

export default mongoose.model("payment_methods", paymentMethodSchema);