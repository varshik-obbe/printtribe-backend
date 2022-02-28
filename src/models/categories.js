import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const categoriesSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    category: {type:String,required:true},
    url: {type:String,required:true,lowercase:true},
    img: {type:String,required:true,lowercase:true},
    colors: [
        {
            colorname: {type: String, required: true},
            value: {type: String, required: true}
        }
    ],
    sizes: [
        {
            sizename: {type: String, required: true}
        }
    ],
    zakekeSides: [
        {
            sidename: {type: String, required: true}
        }
    ],
    maincat: {type:String,required:true, ref: "categories"},
    subcat: {type:String,required:true, ref: "categories"}
},{ timestamps:true });

categoriesSchema.plugin(uniqueValidator);

export default mongoose.model("categories", categoriesSchema);