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
    img: {type: String},
    design_price: {type: String},
    design_img: {type: String},
    gst: {type: String},
    design_gst: {type: String},
    data: {type: String},
    imgsArr: {type: String},
    savedImgsInfo: [
        {
            "width": {type: Number},
            "height": {type: Number},
            "left": {type: Number},
            "top": {type: Number},
            "scaleX": {type: Number},
            "scaleY": {type: Number}
        }
    ],
    textDesign: {type: String}
},{ timestamps:true });


fabricSavedDesignWithProductSchema.plugin(uniqueValidator)

export default mongoose.model('fabricSavedDesignWithProduct',fabricSavedDesignWithProductSchema);