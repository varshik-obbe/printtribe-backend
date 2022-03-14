import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const tasksSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    stream: {type:String,required:true},
    sub_stream: {type:String},
    creator: {type:String,required:true},
    creator_id: {type: String, required: true},
    primary_owner: {type: String, required: true},
    primary_owner_id: {type: String, required: true},
    secondary_owner: {type: String},
    secondary_owner_id: {type: String},
    tertiary_owner: {type: String},
    tertiary_owner_id: {type: String},
    planned_start_date: {type: String},
    actual_start_date: {type:  String},
    planned_completion_date: {type: String},
    actual_completion_date: {type: String},
    time_taken: {type: String},
    remarks: {type: String},
    status: {type: String},
    last_status_update: {type: String}
},{ timestamps:true });

tasksSchema.plugin(uniqueValidator);

export default mongoose.model("tasks", tasksSchema);