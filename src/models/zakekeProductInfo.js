import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const zakekeProductInfoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    productId: {type: String, index: true, unique: true},
    variant: [
        {
            colorName: {type: String, required: true},
            colorId: {type: String, required: true},
            backImgURL: {type: String, required: true},
            frontImgURL: {type: String, required: true}
        }
    ]
},{ timestamps:true });


zakekeProductInfoSchema.plugin(uniqueValidator)

export default mongoose.model('ZakekeProducts',zakekeProductInfoSchema);