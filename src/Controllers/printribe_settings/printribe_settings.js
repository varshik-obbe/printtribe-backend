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

export default { addSettings, getSettings }