import mongoose from "mongoose";
import adminSettings from "../../models/admin_settings";
import ParseErrors from "../../utils/ParseErrors";


export const add_Setting = (req,res) => {
    const { data } = req.body

    const admin_settings = new adminSettings({
        _id: mongoose.Types.ObjectId(),
        admin_id: data.admin_id,
        settings_name: data.settings_name,
        settings_value: data.settings_value,
        active: data.active
    })

    admin_settings.save().then((saveddata) => {
        res.status(201).jsonp({saveddata})
    })
    .catch((err) => res.status(400).json({ errors: ParseErrors(err.errors) }))
}

export const getAll_settings = (req,res) => {
    adminSettings.find()
    .exec()
    .then((data) => {
        const response = {
            count: data.length,
            settingsData: data.map((settings_data) => ({
                id: settings_data._id,
                admin_id: settings_data.admin_id,
                settings_name: settings_data.settings_name,
                settings_value: settings_data.settings_value,
                active: settings_data.active
            }))
        }
        res.status(200).json({settingsData:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const get_settingByName = (req,res) => {
    adminSettings.findOne({'settings_name':req.params.settings_name})
    .exec().
    then((settingsdata)=>{
        res.status(200).json({settings_data:settingsdata});
    })
    .catch((err)=>{
        res.status(500).json({error:{global:"something went wrong"}});
    });
}

export const get_settingById = (req,res) => {
    adminSettings.find({'_id':req.params.id})
    .exec().
    then((settingsdata)=>{
        const response = {
            count:settingsdata.length,
            settingsdata:settingsdata.map((settingrecord)=>({
                id: settingrecord._id,
                admin_id: settingrecord.admin_id,
                settings_name: settingrecord.settings_name,
                settings_value: settingrecord.settings_value,
                active: settingrecord.active
            }))
        }
        res.status(200).json({setting_data:response});
    })
    .catch((err)=>{
        res.status(500).json({error:{global:"something went wrong"}});
    });
}

export const update_settingById = (req,res) => {
    const id = req.query.id
    const { data } = req.body
    adminSettings.updateOne({_id: id}, {$set: data}).exec().then((settingrecord)=>{
        res.status(200).json({success:{global:"Setting is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}


export const delete_setting = (req,res) => {
    const id = req.params.id;
    adminSettings.deleteOne({_id: id},function(err,data){
        if(err){
            console.log(err);
            res.send('error');
        }
        else
        {
            return res.send('success')
        }
    });
}

export default { add_Setting, getAll_settings, get_settingByName, get_settingById, update_settingById, delete_setting }