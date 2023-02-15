import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const productSizeLinkSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    product_id: {type: String, required: true, unique: true, index: true},
    size_link: [
        {
            size: {type: String},
            price : {type: Number}
        }
    ]
}, {timestamps: true})

productSizeLinkSchema.plugin(uniqueValidator);

export default mongoose.model("productsize_link", productSizeLinkSchema)