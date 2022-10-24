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
    mobile: {type: Number},
    buisness_name: {type: String},
    brand_name: {type: String},
    country: {type: String},
    address1: {type: String},
    address2: {type: String},
    address3: {type: String},
    city: {type: String},
    state: {type: String},
    pincode: {type: String},
    gst: {type: String},
    website: {type: String},
    remittance_type: {type: String},
    account_number: {type: String},
    ifsc_code: {type: String},
    bank_name: {type: String},
    customer_img: {type: String},
    verify_mail: {type: String},
    active: {type: String},
    customer_wix: {type: String}
},{ timestamps:true });

customerSchema.methods.setPassword = function setPassword(password){
    this.password = bcrypt.hashSync(password, 10);    
}

customerSchema.pre('findOneAndUpdate', async function (next) {
    try {
        if (this._update.password) {
            const hashed = await bcrypt.hash(this._update.password, 10)
            this._update.password = hashed;
        }
        next();
    } catch (err) {
        return next(err);
    }
});

customerSchema.methods.isValidPassword = function isValidPassword(password) {
    return bcrypt.compareSync(password, this.password);
}

customerSchema.methods.generateJWT = function generateJWT(){
    return jwt.sign({ email: this.email, role:this.persontype }, 'SECRET');
}

customerSchema.methods.toAuthJSON = function toAuthJSON(){
    return{
        email: this.email,
        id: this._id,
        role: this.role,
        token: this.generateJWT()
    }
}

customerSchema.plugin(uniqueValidator)

export default mongoose.model('Customer',customerSchema);