import mongoose from "mongoose";
import { decode } from 'node-base64-image';
import Payment_methods from "../../models/payment_method";
import DeleteFile from "../../utils/DelteFileExists";
import ParseErrors from "../../utils/ParseErrors";


export const add_PaymentMethods = async (req, res) => {
        const { paymentMethodRegisterdata } = req.body;
        if(paymentMethodRegisterdata.logo) {
            await decode(paymentMethodRegisterdata.logo, { fname: './uploads/'+paymentMethodRegisterdata.name, ext: 'jpg' });
        }
        console.log(paymentMethodRegisterdata);
        const logo_url = "uploads/"+paymentMethodRegisterdata.name+".jpg";
        const payment_method = new Payment_methods({
            _id: mongoose.Types.ObjectId(),
            name: paymentMethodRegisterdata.name,
            status: paymentMethodRegisterdata.status,
            logo: logo_url
        });
        payment_method.save().then(async (paymentsAddedValue) => {
            res.status(201).jsonp({ paymentsAddedValue })
        })
            .catch((err) => res.status(400).json({ errors: ParseErrors(err.errors) }));
}

export const get_paymentMethods = async (req,res) => {
    Payment_methods.find()
    .exec()
    .then((paymentData)=>{
        const response = {
            count:paymentData.length,
            paymentmethodData: paymentData.map((payment)=>({
                    id:payment._id,
                    name: payment.name,
                    status: payment.status,
                    logo: payment.logo
                }))
        }
        res.status(200).json({paymentdata:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const get_SinglePaymentMethod = (req,res) => {
    Payment_methods.find({'_id':req.params.id})
    .exec().
    then((paymentdata)=>{
        const response = {
            count:paymentdata.length,
            paymentmethoddata:paymentdata.map((paymentrecord)=>({
                id:paymentrecord._id,
                name: paymentrecord.name,
                status: paymentrecord.status,
                logo: paymentrecord.logo
            
            }))
        }
        res.status(200).json({paymentData:response});
    })
    .catch((err)=>{
        res.status(500).json({error:{global:"something went wrong"}});
    });
}

export const update_paymentMethod = async (req,res) => {
    const id = req.query.id;
    let { data } = req.body;
    if(data.logo) {
        await Payment_methods.find({'_id':id})
        .exec().
        then(async (paymentdata)=>{
            await Promise.all(paymentdata.map(async (paymentmethodrecord) => {
                console.log('payment data: '+paymentmethodrecord);
                await DeleteFile(paymentmethodrecord.name+".jpg");
                if(data.name)
                {
                    await decode(data.logo, { fname: './uploads/'+data.name, ext: 'jpg' });
                    data.logo = "uploads/"+data.name+".jpg";                    
                }
                else {
                    await decode(data.logo, { fname: './uploads/'+paymentmethodrecord.name, ext: 'jpg' });
                    data.logo = "uploads/"+paymentmethodrecord.name+".jpg";
                }
                console.log('logo url is'+data.logo);
            }));
        })
        .catch((err)=>{
            res.status(500).json({error:{global:"could not find existing payment"}});
        });
    }
    Payment_methods.updateOne({_id: id}, {$set: data}).exec().then((paymentRecord)=>{
        res.status(200).json({success:{global:"Payment Method is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const delete_PaymentMethods = (req,res) => {
    const id = req.params.id;
    Payment_methods.deleteOne({_id: id},function(err,data){
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

export default { add_PaymentMethods, get_paymentMethods, get_SinglePaymentMethod, update_paymentMethod, delete_PaymentMethods }