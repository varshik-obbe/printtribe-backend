import mongoose from "mongoose";
import printribeSettingsModel from "../../models/printribe_settings";

export const addSettings = (req,res) => {
    const { settings_data } = req.body;


    const settingsSave = new printribeSettingsModel({
        _id: mongoose.Types.ObjectId(),
        company_name: 'printribe',
        invoice_no: settings_data.invoice_no
    })

    settingsSave.save().then((savedData) => {
        res.status(201).json({ data: savedData })
    })
    .catch((err) => {
        console.log("something went wrong while saving"+err)
        res.status(400).json({ global: { error: "could not save data" } })
    })
}

export const getSettings = (req,res) => {
    printribeSettingsModel.findOne({ 'company_name': 'printribe' })
    .exec()
    .then((data) => {
        res.status(200).json({ data: data })
    })
    .catch((err) => {
        console.log("something went wrong while saving"+err)
        res.status(400).json({ global: { error: "could not save data" } })
    })
}

export const updateSettings = (req,res) => {
    const id = req.params.id
    const { data } = req.body
    printribeSettingsModel.updateOne({_id: id}, {$set: data}).exec().then((settingrecord)=>{
        res.status(200).json({success:{global:"Setting is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export default { addSettings, getSettings, updateSettings }