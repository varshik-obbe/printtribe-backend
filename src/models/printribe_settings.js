import mongoose from "mongoose";


const printribeSettingsSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    company_name: {type:String},
    logo: {type:String},
    invoice_no: {type: String}
},{ timestamps:true });

// categoriesSchema.plugin(uniqueValidator);

export default mongoose.model("printribe_settings", printribeSettingsSchema);