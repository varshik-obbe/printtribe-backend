import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { decode } from 'node-base64-image';
import User from "../../models/user";
import ParseErrors from "../../utils/ParseErrors";


export const add_user = (req,res)=>{
    const { userRegisterdata } = req.body;
    console.log(userRegisterdata);
    User.findOne({ email: userRegisterdata.email }).exec().then((userData) => {
        if(userData) {
            res.status(400).json({errors: "user already exists"})
        }
        else {
            const user = new User({
                _id:mongoose.Types.ObjectId(),
                email:userRegisterdata.email,
                username:userRegisterdata.username,
                role:userRegisterdata.role,
                modules: userRegisterdata.modules
            })
            user.setPassword(userRegisterdata.password)
            user.save().then((userRecord)=>res.status(201).json({userRecord}))
            .catch((err)=>res.status(400).json({errors:ParseErrors(err.errors)}));
        }
    })
    .catch((err) => res.status(400).json({errors: "error while fetching users"}))
}

export const login = (req,res) => {
    const { credentials } = req.body;
    const todayDate = new Date();
    
    User.findOne({email: credentials.email,role: credentials.role }).exec().then((UserRecord)=>{
        if(UserRecord && UserRecord.isValidPassword(credentials.password)){
            res.status(200).json({user:UserRecord.toAuthJSON()});
            
        }else{
            res.status(400).json({errors:{global:"invalid credentials"}});
        }
    }).catch((err) => 
    {
        console.log(err)
        res.status(400).json({errors:{global:"invalid credentials"}})

    }
    );
}

export const getUsers = (req,res) => {
    User.find()
    .exec()
    .then((userdata)=>{
        const response = {
            count:userdata.length,
            userdata: userdata.map((user)=>({
                    id:user._id,
                    email: user.email,
                    username:user.username,
                    role: user.role,
                    profile_img: user.profile_img,
                    modules: user.modules
                }))
        }
        res.status(200).json({userdata:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const getUserById = (req,res)=>{
    const id = req.query.id;
    User.findById(id).select('-password -__v').exec().then((userRecordData)=>{
        res.status(200).json({userRecordData})
    }).catch((err)=>{
        res.status(404).json({error:{global:"not found"}});
    });
}

export const updateUser = async (req,res) => {
    const id = req.query.id;
    const { data } = req.body;
    let dateVal = Date.now().toString();
    if(data.profile_img) {
        await decode(data.profile_img, { fname: './uploads/'+ dateVal + data.username.replace(/ |'/g,"_").toLowerCase(), ext: data.extension });
        data.profile_img = '/uploads/'+ dateVal + data.username.replace(/ |'/g,"_")+"."+data.extension
    }
    User.updateOne({_id: id}, {$set: data}).exec().then((userRecord)=>{
        res.status(200).json({success:{global:"User details is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const changePass = (req,res) => {
 
    let { updateData } = req.body;

    User.findOne({ _id: updateData.id }).exec().then((UserRecord)=>{
        if(UserRecord && UserRecord.isValidPassword(updateData.existing_password)){
            updateData.password = bcrypt.hashSync(updateData.password, 10)

            User.findOneAndUpdate(
                { _id: updateData.id },
                { password: updateData.password },
                { useFindAndModify: false }
            )
            .exec()
            .then((data) => {
                            res.status(200).json({success:{global:"password updated successfully"}})
            })
            .catch((err) => res.status(200).json({success:{global:"could not find data"}}))
            
        }else{
            res.status(400).json({errors:{global:"password is incorrect"}});
        }
    }).catch((err) => 
    {
        console.log(err)
        res.status(400).json({errors:{global:"could not get the user"}})

    }
    );
}

export const delete_User = (req,res) => {
    const id = req.params.id;
    User.deleteOne({_id: id},function(err,data){
        if(err){
            console.log(err);
            res.send('error');
        }
        else
        {
            console.log(data);
            return res.send('success')
        }
    });
}

export default { add_user, login, getUsers, getUserById, updateUser, delete_User, changePass }