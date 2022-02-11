import mongoose from "mongoose";
import razorpay from "razorpay";
import paymentHistoryModel from "../../models/payment_history";
import walletModel from "../../models/wallet";
import validatePaymentVerification from "../../utils/razorpayUtils";

export const add_credits = (req,res) => {
    const { walletData } = req.body

    walletModel.findOne({ 'customer_id': walletData.customer_id })
    .exec()
    .then((data) => {
        if(data) {

        }
        else {
            let status = validatePaymentVerification({"order_id": walletData.razorpay_order_id, "payment_id": walletData.razorpay_payment_id }, walletData.razorpay_signature, process.env.RAZORPAY_SECRET);
            
            if(status) {
                const walletSave = new walletModel({
                    _id: mongoose.Types.ObjectId(),
                    customer_id: walletData.customer_id,
                    currency: walletData.currency,
                    amount: walletData.amount,
                    status: walletData.status
                });
            
                walletSave.save().then((savedData) => {
                    res.status(201).json({ savedData: savedHistoryData })
                })
                .catch((err) => res.status(400).json({errors:{ global: "could not save wallet data"+err }}))
            }            
        }
    })
}

export const instantiateRazorpay = (req,res) => {
    const { insdata } = req.body;

    let instance = new razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
    })

    let refId = Date.now();

    let amountInt = parseInt(insdata.amount);

    console.log("amount is "+amountInt)

    var options = {
        amount: amountInt,
        currency: "INR",
        receipt: refId.toString()
      };

      instance.orders.create(options, function(err, order) {
        if(err) {
            console.log("error is"+err.error.description)
            res.status(400).json({ error: { global: "could not generate razorpay order" }})
        }
        else {
            let nowDate = new Date();
            const paymentHistoryData = new paymentHistoryModel({
                _id:mongoose.Types.ObjectId(),
                customer_id: insdata.customer_id,
                currency: insdata.currency,
                amount: insdata.amount,
                reference_id: refId.toString(),
                payment_order_id: order.id,
                payment_date: nowDate,
                payment_status: "created"
            })
            paymentHistoryData.save().then((savedHistoryData) => {
                res.status(201).json({ savedhistoryData: savedHistoryData })
            })
            .catch((err) => {
                console.log("error saving payment history"+err)
                res.status(500).json({error:{global:"could not save payment history"}})
            })
        }
      })
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

export default { add_credits, get_walletByID, instantiateRazorpay }