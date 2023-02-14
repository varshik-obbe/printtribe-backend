import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const fabricSavedDesignWithProductSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    productId: {type: String},
    customerId: {type: String},
    name: {type: String},
    description: {type: String},
    price: {type: String},
    side: {type: String},
    color: {type: String},
    size: {type: String},
    img: {type: String}
},{ timestamps:true });


fabricSavedDesignWithProductSchema.plugin(uniqueValidator)

export default mongoose.model('fabricSavedDesignWithProduct',fabricSavedDesignWithProductSchema);