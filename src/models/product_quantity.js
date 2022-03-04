import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const productQuantSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    product_id: {type: String, required: true, unique: true, index: true},
    variants: [
        {
            color: {type: String, required: true},
            size: {type: String, required: true},
            quantity: {type: String, required: true},
            color_code: {type: String}
        }
    ]
}, {timestamps: true})

productQuantSchema.plugin(uniqueValidator);

export default mongoose.model("product_quantity", productQuantSchema)