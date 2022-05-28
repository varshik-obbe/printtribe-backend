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
                    left: {type: Number},
                    width: {type: Number},
                    height: {type: Number}
                }
            ,
            backImgDimensions: 
                {
                    top: {type: Number},
                    left: {type: Number},
                    width: {type: Number},
                    height: {type: Number}
                },
            leftImgURL: {type: String},
            rightImgURL: {type: String},
            rightImgDimensions:
                {
                    top: {type: Number},
                    left: {type: Number},
                    width: {type: Number},
                    height: {type: Number}
                },
            leftImgDimensions: 
                {
                    top: {type: Number},
                    left: {type: Number},
                    width: {type: Number},
                    height: {type: Number}
                },
            frontCanvasPricing: [
                    {
                        width: {type: Number},
                        height: {type: Number},
                        price: {type: Number}
                    }
                ],
            backCanvasPricing: [
                    {
                        width: {type: Number},
                        height: {type: Number},
                        price: {type: Number}
                    }
                ],
            leftCanvasPricing: [
                    {
                        width: {type: Number},
                        height: {type: Number},
                        price: {type: Number}
                    }
                ],
            rightCanvasPricing: [
                    {
                        width: {type: Number},
                        height: {type: Number},
                        price: {type: Number}
                    }
                ]                                                
        }
    ]
},{ timestamps:true });


fabricProductInfoSchema.plugin(uniqueValidator)

export default mongoose.model('fabricProducts',fabricProductInfoSchema);