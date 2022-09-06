import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const productsizechartSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    product_id: {type: String, required: true, unique: true, index: true},
    centimeters: [
        {
            size: {type: String},
            length: {type: String},
            chest : {type: String}
        }
    ],
    inches: [
        {
            size: {type: String},
            length: {type: String},
            chest : {type: String}
        }
    ]
}, {timestamps: true})

productsizechartSchema.plugin(uniqueValidator);

export default mongoose.model("product_sizechart", productsizechartSchema)