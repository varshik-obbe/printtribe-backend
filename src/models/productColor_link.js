import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const productColorLinkSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    product_id: {type: String, required: true, unique: true, index: true},
    color_links: [
        {
            color: {type: String, required: true},
            color_code: {type: String},
            imgs : {type: Array}
        }
    ]
}, {timestamps: true})

productColorLinkSchema.plugin(uniqueValidator);

export default mongoose.model("productcolor_link", productColorLinkSchema)