import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const fabricProductInfoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    productId: {type: String, index: true, unique: true},
    variant: [
        {
            colorName: {type: String, required: true},
            backImgURL: {type: String},
            frontImgURL: {type: String},
            frontImgDimensions:
                {
                    top: {type: Number},
                    bottom: {type: Number},
                    left: {type: Number},
                    right: {type: Number}
                }
            ,
            backImgDimensions: 
                {
                    top: {type: Number},
                    bottom: {type: Number},
                    left: {type: Number},
                    right: {type: Number}
                },
            leftImgURL: {type: String},
            rightImgURL: {type: String},
            rightImgDimensions:
                {
                    top: {type: Number},
                    bottom: {type: Number},
                    left: {type: Number},
                    right: {type: Number}
                },
            leftImgDimensions: 
                {
                    top: {type: Number},
                    bottom: {type: Number},
                    left: {type: Number},
                    right: {type: Number}
                },
        }
    ]
},{ timestamps:true });


fabricProductInfoSchema.plugin(uniqueValidator)

export default mongoose.model('fabricProducts',fabricProductInfoSchema);