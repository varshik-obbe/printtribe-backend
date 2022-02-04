import mongoose from "mongoose";
import walletModel from "../../models/wallet";
import ParseErrors from "../../utils/ParseErrors";


export const add_credits = (req,res) => {
    const { walletData } = req.body
    
    const walletSave = new walletModel({
        _id: mongoose.Types.ObjectId(),
        customer_id: walletData.customer_id,
        currency: walletData.currency,
        amount: walletData.amount,
        status: walletData.status
    });

    walletSave.save().then((savedData) => {
        res.status(201).json({ savedData: savedData })
    })
    .catch((err) => res.status(400).json({errors:ParseErrors(err.errors)}))
}

export const get_walletByID = (req,res) => {
    const custId = req.params.id;

    walletModel.findOne({ 'customer_id': custId})
    .exec()
    .then((data) => {
        res.status(200).json({ wallet: data })
    })
    .catch((err) => res.status(500).json({error:{global:"could not fetch data"}}))
}

export default { add_credits, get_walletByID }