import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const customerSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    username:{type:String},
    password:{type:String,required:true,lowecase:true},
    email:{type:String,required:true,lowercase:true,index:true,unique: true},
    role:{type:String,required:true,lowecase:true},
    mobile: {type: Number,required:true},
    buisness_name: {type: String},
    brand_name: {type: String},
    country: {type: String, required: true},
    address1: {type: String, required: true},
    address2: {type: String},
    address3: {type: String},
    city: {type: String},
    state: {type: String},
    pincode: {type: String, required: true},
    gst: {type: String},
    website: {type: String},
    account_number: {type: String},
    ifsc_code: {type: String},
    bank_name: {type: String}
},{ timestamps:true });

customerSchema.methods.setPassword = function setPassword(password){
    this.password = bcrypt.hashSync(password, 10);    
}

customerSchema.methods.isValidPassword = function isValidPassword(password) {
    return bcrypt.compareSync(password, this.password);
}

customerSchema.methods.generateJWT = function generateJWT(){
    return jwt.sign({ email: this.email, role:this.persontype }, 'SECRET');
}

customerSchema.methods.toAuthJSON = function toAuthJSON(){
    return{
        email: this.email,
        role: this.role,
        token: this.generateJWT()
    }
}

customerSchema.plugin(uniqueValidator)

export default mongoose.model('Customer',customerSchema);