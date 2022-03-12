import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    username:{type:String},
    password:{type:String,required:true,lowecase:true},
    email:{type:String,required:true,lowecase:true,index:true,unique: true},
    role:{type:String,required:true,lowecase:true},
    modules: {type: Array},
    profile_img: {type: String}
},{ timestamps:true });

userSchema.methods.setPassword = function setPassword(password){
    this.password = bcrypt.hashSync(password, 10);    
}

userSchema.methods.isValidPassword = function isValidPassword(password) {
    return bcrypt.compareSync(password, this.password);
}

userSchema.methods.generateJWT = function generateJWT(){
    return jwt.sign({ email: this.email, role:this.persontype }, 'SECRET');
}

userSchema.methods.toAuthJSON = function toAuthJSON(){
    return{
        id: this._id,
        email: this.email,
        username: this.username,
        role: this.role,
        modules: this.modules,
        token: this.generateJWT()
    }
}

userSchema.plugin(uniqueValidator)

export default mongoose.model('User',userSchema);