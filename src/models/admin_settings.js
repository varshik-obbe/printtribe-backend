import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const adminSettingsSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    admin_id: {type:String,required:true},
    settings_name: {type:String,required:true,unique: true},
    settings_value: {type:String,required:true},
    active: {type:String,required:true}
},{ timestamps:true });

adminSettingsSchema.plugin(uniqueValidator);

export default mongoose.model("admin_settings", adminSettingsSchema);