import paymentHistoryModel from "../models/payment_history";
import walletModel from "../models/wallet";

export const add_credits = async (order_id,order_status,amount) => {

    // let token = jwt.sign({
    //     exp: Math.floor(Date.now() / 1000) + (60 * 60),
    //     data: {
    //         customer_id: '6426a7945ef40df1c2c86818',
    //         currency: "INR",
    //         amount: 200.00,
    //         order_id: "86a573c2-5056-4121-822d-7803efd712db"
    //     }
    //   }, 'PRINTSECRET');

    // console.log("token is", token);
        let success = "";
        
        success = await paymentHistoryModel.findOne({ 'payment_order_id': order_id })
            .exec()
            .then(async (getData) => {
                if(getData) {
                if(getData.payment_status !== undefined && (getData.payment_status == "success" || getData.payment_status == "failed")) {
                    return "order already completed";
                }        
                else {
                    success = await walletModel.findOne({ 'customer_id': getData.customer_id })
                    .exec()
                    .then(async (data) => {
                        // instance.orders.fetch(walletData.order_id , function (err, response) {
                        //     if(err) {
                        //         console.log("error is"+err)
                        //         res.status(400).json({errors:{ global: "could not fetch order" }})
                        //     }
                        //     else {
                                let status = order_status;
                                console.log("status is"+status)
                                if(data) {
                                    if(status == "Success") {
                                        let newAmount = parseInt(data.amount) + parseInt(amount);
                                        success = await walletModel.updateOne({ 'customer_id': getData.customer_id }, {$set: { 'amount': newAmount }}).then(async (updatedData) => {
                                                success = await paymentHistoryModel.updateOne({ 'payment_order_id': order_id }, { $set: { 'payment_status': "success" } })
                                                .then(async (updatehistory) => {
                                                    return "Success";
                                                })
                                                .catch(async (err) => {
                                                    return "Could not update payment history";
                                                })
                                                return success;
                                        })
                                        .catch(async (err) => { return "Could not update wallet"; })
                                        return success;
                                    }
                                    else {
                                        success = await paymentHistoryModel.updateOne({ 'payment_order_id': getData.customer_id }, { $set: { 'payment_status': "failed" } })
                                        .then(async (updated) => {
                                            return "Payment failed";
                                        })
                                        .catch(async (err) => {
                                            return "Could not update payment failed";
                                        })
                                        return success;
                                    }                        
                                }
                                else {
                                    
                                    console.log("status is:"+status);
                                    if(status == "Success") {
                                        const walletSave = new walletModel({
                                            _id: mongoose.Types.ObjectId(),
                                            customer_id: order_id,
                                            currency: "INR",
                                            amount: amount,
                                            status: "active"
                                        });
                                    
                                        success = await walletSave.save().then(async (savedData) => {
                                            success = await paymentHistoryModel.updateOne({ 'payment_order_id': order_id }, { $set: { 'payment_status': "success" } })
                                            .then(async (updated) => {
                                                return "Success";
                                            })
                                            .catch(async (err) => {
                                                return "Could not update payment history";
                                            })
                                            return success;
                                        })
                                        .catch(async (err) => { return "Could not update wallet"; })
                                        return success;
                                    }
                                    else {
                                        success = await paymentHistoryModel.updateOne({ 'payment_order_id': order_id }, { $set: { 'payment_status': "failed" } })
                                        .then(async (updated) => {
                                            return "Payment failed";
                                        })
                                        .catch(async (err) => {
                                            return "Could not update payment failed";
                                        })     
                                        return success;                   
                                    }            
                            }
                            return success;
                    })
                    .catch(async (err) => { return false }) 
                    return success;     
                }
            }
            else {
                console.log("order not instantiated")
                return  "order not instantiated";
            }
            })
            .catch(async (err) => {
                console.log("failed fetching payment history data"+err)
                return "failed fetching payment history data";
            })
            return success;
}

export default { add_credits }