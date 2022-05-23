import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const fabricDesignSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    productId: {type: String},
    customerId: {type: String},
    color: {type: String},
    side: {type: String},
    data: {type: String},
    url: {type: String}
},{ timestamps:true });


fabricDesignSchema.plugin(uniqueValidator)

export default mongoose.model('fabricDesigns',fabricDesignSchema);