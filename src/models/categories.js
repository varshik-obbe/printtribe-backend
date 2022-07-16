import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const categoriesSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    category: {type:String,required:true},
    url: {type:String,required:true,lowercase:true},
    img: {type:String,required:true,lowercase:true},
    colors: [
        {
            colorname: {type: String},
            value: {type: String}
        }
    ],
    sizes: [
        {
            sizename: {type: String}
        }
    ],
    zakekeSides: [
        {
            sidename: {type: String}
        }
    ],
    position:{type:Number}, 
    visible: {type: String},
    maincat: {type:String,required:true, ref: "categories"},
    subcat: {type:String,required:true, ref: "categories"}
},{ timestamps:true });

categoriesSchema.plugin(uniqueValidator);

export default mongoose.model("categories", categoriesSchema);