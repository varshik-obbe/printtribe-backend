import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const fabricSavedDesignSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    productId: {type: String},
    customerId: {type: String},
    imgsArr: {type: Array}
},{ timestamps:true });


fabricSavedDesignSchema.plugin(uniqueValidator)

export default mongoose.model('fabricSavedDesigns',fabricSavedDesignSchema);