import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const fabricDesignSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    productId: {type: String},
    color: {type: String},
    side: {type: String},
    data: {type: String}
},{ timestamps:true });


fabricDesignSchema.plugin(uniqueValidator)

export default mongoose.model('fabricDesigns',fabricDesignSchema);