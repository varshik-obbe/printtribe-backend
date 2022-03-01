import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const zakekeProductInfoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    productId: {type: String, index: true, unique: true},
    variant: [
        {
            colorName: {type: String, required: true},
            backImgURL: {type: String},
            frontImgURL: {type: String},
            frontImgMask: {type: String},
            backImgMask: {type: String},
            leftImgURL: {type: String},
            rightImgURL: {type: String},
            rightImgMask: {type: String},
            leftImgMask: {type: String}
        }
    ]
},{ timestamps:true });


zakekeProductInfoSchema.plugin(uniqueValidator)

export default mongoose.model('ZakekeProducts',zakekeProductInfoSchema);