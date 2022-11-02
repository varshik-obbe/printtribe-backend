import mongoose from "mongoose";
import razorpay from "razorpay";
import { v4 as uuidv4 } from 'uuid';
import CustomerModel from "../../models/customers";
import paymentHistoryModel from "../../models/payment_history";
import walletModel from "../../models/wallet";

export const add_credits = (req,res) => {
    const { walletData } = req.body

    console.log("customer id is:"+walletData.customer_id)
    let instance = new razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
    })

    paymentHistoryModel.findOne({ 'payment_order_id': walletData.razorpay_order_id })
    .exec()
    .then((getData) => {
        if(getData.payment_status == "success" || getData.payment_status == "failed") {
            res.status(400).json({errors:{ global: "order is already completed" }})
        }        
        else {
            walletModel.findOne({ 'customer_id': walletData.customer_id })
            .exec()
            .then((data) => {
                instance.orders.fetch(walletData.razorpay_order_id , function (err, response) {
                    if(err) {
                        console.log("error is"+err)
                        res.status(400).json({errors:{ global: "could not fetch order" }})
                    }
                    else {
                        let status = response.status;
                        console.log("status is"+status)
                        if(data) {
                            if(status == "paid") {
                                let newAmount = parseInt(data.amount) + parseInt(walletData.amount);
                                walletModel.updateOne({ 'customer_id': walletData.customer_id }, {$set: { 'amount': newAmount }}).then((updatedData) => {
                                        paymentHistoryModel.updateOne({ 'payment_order_id': walletData.razorpay_order_id }, { $set: { 'payment_status': "success" } })
                                        .then((updatehistory) => {
                                            res.status(201).json({ success: { global: "updated successfully" } })
                                        })
                                        .catch((err) => {
                                            res.status(400).json({errors:{ global: "error when updating payment history"+err }})
                                        })
                                })
                                .catch((err) => res.status(400).json({errors:{ global: "could not update data"+err }}))
                            }
                            else {
                                paymentHistoryModel.updateOne({ 'payment_order_id': walletData.razorpay_order_id }, { $set: { 'payment_status': "failed" } })
                                .then((updated) => {
                                    res.status(400).json({errors:{ global: "payment was not completed" }})
                                })
                                .catch((err) => {
                                    res.status(400).json({errors:{ global: "error when updating payment history"+err }})
                                })
                            }                        
                        }
                        else {
                            
                            console.log("status is:"+status);
                            if(status == "paid") {
                                const walletSave = new walletModel({
                                    _id: mongoose.Types.ObjectId(),
                                    customer_id: walletData.customer_id,
                                    currency: walletData.currency,
                                    amount: walletData.amount,
                                    status: "active"
                                });
                            
                                walletSave.save().then((savedData) => {
                                    paymentHistoryModel.updateOne({ 'payment_order_id': walletData.razorpay_order_id }, { $set: { 'payment_status': "success" } })
                                    .then((updated) => {
                                        res.status(201).json({ success: { global: "wallet added successfully" } })
                                    })
                                    .catch((err) => {
                                        res.status(400).json({errors:{ global: "error when updating payment history"+err }})
                                    })
                                })
                                .catch((err) => res.status(400).json({errors:{ global: "could not save wallet data"+err }}))
                            }
                            else {
                                paymentHistoryModel.updateOne({ 'payment_order_id': walletData.razorpay_order_id }, { $set: { 'payment_status': "failed" } })
                                .then((updated) => {
                                    res.status(400).json({errors:{ global: "payment was not completed" }})
                                })
                                .catch((err) => {
                                    res.status(400).json({errors:{ global: "error when updating payment history"+err }})
                                })                        
                            }            
                    }
                    }
                })
            })
            .catch((err) => res.status(400).json({errors:{ global: "could not fetch data"+err }}))      
        }
    })
    .catch((err) => {
        console.log("failed fetching payment history data"+err)
        res.status(400).json({errors:{ global: "could not fetch data" }})
    })
}

export const getWalletHistory = (req,res) => {
    const custId = req.params.id;

    paymentHistoryModel.find({ 'customer_id': custId })
    .exec()
    .then((historyData) => {
        res.status(200).json({ historyData: historyData })
    })
    .catch((err) => {
        console.log("failed fetching wallet history data"+err)
        res.status(400).json({errors:{ global: "could not fetch data" }})
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

export const debitWallet = (req,res) => {
    const { customer_data } = req.body;

    walletModel.findOne({ 'customer_id': customer_data.customer_id })
    .exec()
    .then((data) => {
        if(data) {
            let newAmount = parseInt(data.amount) - parseInt(customer_data.amount)
            let nowDate = new Date();
            let randomstring = uuidv4();
            const paymentHistoryData = new paymentHistoryModel({
                _id:mongoose.Types.ObjectId(),
                customer_id: customer_data.customer_id,
                currency: "INR",
                amount: customer_data.amount,
                reference_id: randomstring,
                payment_order_id: randomstring,
                payment_date: nowDate,
                payment_status: "debited"
            })
            paymentHistoryData.save().then((savedHistoryData) => {
                walletModel.findOneAndUpdate({ 'customer_id': customer_data.customer_id }, { $set: { 'amount': newAmount } }, { new: true })
                .then((updated) => {
                    res.status(200).json({ global: { success: updated } })
                })
                .catch((err) => {
                    res.status(400).json({ global: { error: "error occured while updating" } })
                })
            })
            .catch((err) => {
                console.log("error saving payment history"+err)
                res.status(500).json({error:{global:"could not save debit history"}})
            })
        }
        else {
            res.status(400).json({ global: { error: "no data found" } })
        }
    })
    .catch((errdata) => {
        res.status(400).json({ global: { error: "error occured while fetching" } })
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

export const remitAccount = (req,res) => {
    const { customer_data } = req.body;

    CustomerModel.findOne({ '_id': customer_data.customer_id })
    .exec()
    .then((custData) => {
        if(custData) {
            if(custData.remittance_type == "bank") {
                res.status(200).json({ data: { "bank_details": custData } })
            }
            else {
                walletModel.findOne({ 'customer_id': customer_data.customer_id })
                .exec()
                .then((data) => {
                    if(data) {
                        let newAmount = parseInt(data.amount) + parseInt(customer_data.amount)                        
                        let nowDate = new Date();
                        let randomstring = uuidv4();
                        const paymentHistoryData = new paymentHistoryModel({
                            _id:mongoose.Types.ObjectId(),
                            customer_id: customer_data.customer_id,
                            currency: "INR",
                            amount: customer_data.amount,
                            reference_id: randomstring,
                            payment_order_id: customer_data.order_id,
                            payment_date: nowDate,
                            payment_status: "remitted"
                        })
                        paymentHistoryData.save().then((savedHistoryData) => {
                            walletModel.findOneAndUpdate({ 'customer_id': customer_data.customer_id }, { $set: { 'amount': newAmount } }, { new: true })
                            .then((updated) => {
                                res.status(200).json({ global: { success: updated } })
                            })
                            .catch((err) => {
                                res.status(400).json({ global: { error: "error occured while updating" } })
                            })
                        })
                        .catch((err) => {
                            console.log("error saving payment history"+err)
                            res.status(500).json({error:{global:"amount aleady remitted"}})
                        })
                    }
                    else {
                        res.status(400).json({ global: { error: "no data found" } })
                    }
                })
                .catch((errdata) => {
                    res.status(400).json({ global: { error: "error occured while fetching" } })
                })
            }
        }
        else {
            res.status(400).json({ global: { error: "customer data is empty" } })            
        }
    })
    .catch((errdata) => {
        res.status(400).json({ global: { error: "error occured while fetching"+errdata } })
    })
}

export const updateByWebhook = (req,res) => {
    
}

export default { add_credits, get_walletByID, instantiateRazorpay, debitWallet, getWalletHistory, remitAccount }