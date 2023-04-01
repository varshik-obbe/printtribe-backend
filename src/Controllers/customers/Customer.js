import mongoose from "mongoose";
import { decode } from 'node-base64-image';
import { v4 as uuidv4 } from 'uuid';
import Customer from "../../models/customers";
import forgotPassModel from "../../models/forgot_passwords";
import ParseErrors from "../../utils/ParseErrors";
import SendMail from "../../utils/SendMail";
import sendWelcomeMail from "../../utils/sendWelcomeMail";
import sendVerifyMail from "../../utils/sendVerifyMail";


export const add_customer = async (req,res)=>{
    const { customerRegisterdata } = req.body;
    console.log(customerRegisterdata);
    let dateVal = Date.now();
    let imagUrl = "";
    let checkReg;
    if(customerRegisterdata.customer_img) {
        await decode(customerRegisterdata.customer_img, { fname: './uploads/'+ dateVal.toString() + "customer", ext: 'jpg' });
        imagUrl = '/uploads/'+ dateVal.toString() + "customer"+".jpg";
    }

    checkReg = await Customer.find({ 'active': "yes" }).count();

    Customer.findOne({ 'email': customerRegisterdata.email })
    .exec()
    .then((data) => {
        if(data) {
            res.status(400).json({ errors: "email already exists"});
        }
        else if(checkReg > 25){
            res.status(400).json({ errors: "already reached registration limit"});
        }
        else {
            const customer = new Customer({
                _id:mongoose.Types.ObjectId(),
                email:customerRegisterdata.email,
                username:customerRegisterdata.username,
                role:customerRegisterdata.role,
                mobile: customerRegisterdata.mobile,
                buisness_name: customerRegisterdata.buisness_name,
                brand_name: customerRegisterdata.brand_name,
                country: customerRegisterdata.country,
                address1: customerRegisterdata.address1,
                address2: customerRegisterdata.address2,
                address3: customerRegisterdata.address3,
                city: customerRegisterdata.city,
                state: customerRegisterdata.state,
                pincode: customerRegisterdata.pincode,
                gst: customerRegisterdata.gst,
                website: customerRegisterdata.website,
                account_number: customerRegisterdata.account_number,
                ifsc_code: customerRegisterdata.ifsc_code,
                bank_account_name: "",
                bank_name: customerRegisterdata.bank_name,
                customer_img: imagUrl,
                active: "no"
            });
            customer.setPassword(customerRegisterdata.password)
            customer.save().then((customerRecord)=> {
                const min = 100000;
                const max = 999999;
                const rand = min + Math.random() * (max - min);
                Customer.updateOne({_id: customerRecord._id}, {$set: {'verify_mail': rand.toFixed(0)}})
                .then((updatedData) => {
                    let name = "";
                    if(customerRecord.username) {
                        name = customerRecord.username;
                    }
                    else {
                        name = customerRecord.email.split('@')[0];
                    }
                    let title = "printribe mail"
                    let hello = "hello fellow dropshipper"
                    let message = "thank you for registering with us, your Verification Code is :"+rand.toFixed(0)
                    let second_message = "for any further assistance please reach out to us. please find the partner panel link below."
                    let link = "https://theprintribe.com/verify/"+customerRegisterdata.email+"/"+rand.toFixed(0).toString();
                    sendWelcomeMail(name,customerRegisterdata.email);
                    sendVerifyMail(name,customerRegisterdata.email,link)
                    res.status(201).json({customerRecord})  
                })
                .catch((err)=>res.status(400).json({errors:"could not update the table"}))
            })
            .catch((err)=>res.status(400).json({errors:ParseErrors(err.errors)}));
        }
    });
}

export const login = (req,res) => {
    const { credentials } = req.body;
    const todayDate = new Date();
    
    Customer.findOne({email: credentials.email,role: credentials.role, active: "yes" }).exec().then((customerRecord)=>{
        if(customerRecord && customerRecord.isValidPassword(credentials.password)){
            res.status(200).json({customer:customerRecord.toAuthJSON()});
            
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

export const verifyMail = (req,res) => {
    const { data } = req.body;

    Customer.findOne({email: data.email, verify_mail: data.verificationId})
    .exec()
    .then((returnData) => {
        if(returnData) {
            Customer.updateOne({email: data.email}, {$set: {'active': 'yes'}}).exec()
            .then((updatedData) => {
                res.status(200).json({success:"updated successfully"});
            })
            .catch((err) => res.status(400).json({errors:"error occured while updating"}))
        }
        else {
            res.status(400).json({errors:"verification failed"})
        }
    })
    .catch((err) => res.status(400).json({errors:"error occured while fetching data"}))
}

export const getCustomers = (req,res) => {
    Customer.find()
    .exec()
    .then((customerdata)=>{
        const response = {
            count:customerdata.length,
            customerdata: customerdata.map((customer)=>({
                    id:customer._id,
                    email: customer.email,
                    username:customer.username,
                    role: customer.role,
                    mobile: customer.mobile,
                    buisness_name: customer.buisness_name,
                    brand_name: customer.brand_name,
                    country: customer.country,
                    address1: customer.address1,
                    address2: customer.address2,
                    address3: customer.address3,
                    city: customer.city,
                    state: customer.state,
                    pincode: customer.pincode,
                    gst: customer.gst,
                    website: customer.website,
                    account_number: customer.account_number,
                    ifsc_code: customer.ifsc_code,
                    bank_account_name: customer.bank_account_name,
                    bank_name: customer.bank_name,
                    customer_img: customer.customer_img,
                    active: customer.active
                }))
        }
        res.status(200).json({customerdata:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const getCustomerById = (req,res)=>{
    const id = req.query.id;
    Customer.findById(id).select('-password -__v').exec().then((customerRecordData)=>{
        res.status(200).json({customerRecordData})
    }).catch((err)=>{
        res.status(404).json({error:{global:"not found"}});
    });
}

export const forgotPassword = (req,res) => {
    const email = req.params.email


    Customer.findOne({ 'email': email })
    .exec()
    .then((data) => {
        if(data) {
            let randomstring = uuidv4();
            let exp_date = new Date();
            exp_date = addDays(exp_date, 2);

            const forgotPassSave = new forgotPassModel({
                _id:mongoose.Types.ObjectId(),
                customer_email: data.email,
                customer_id:data._id,
                random_string: randomstring,
                expiry_date: exp_date
            })

            forgotPassSave.save()
            .then(async (savedata) => {
                let title = "printribe mail"
                let hello = "hello customer"
                let message = "you have opted for password reset, please click the link below to reset it."
                let second_message = "for any further assistance please reach out to us."
                let link = "https://theprintribe.com/forgotPass/"+randomstring;
                await SendMail(title,hello,message,second_message,data.email,link); 

                res.status(201).json({success: {global: "mail sent successfully"}})
            })
            .catch((err) => {
                res.status(400).json({error:{global:"coluld not send mail"}})
            }) 
        }
        else {
            res.status(400).json({error:{global:"user with this email was not found"}});
        }
    })
    .catch((err) => res.status(400).json({error:{global:"something went wrong while fetching data"}}))
}

export const resetPass = (req,res) => {
    const tokenString = req.params.id

    forgotPassModel.findOne({ 'random_string': tokenString })
    .exec()
    .then((data) => {
        if(data) {
            res.status(200).json({ data: data })
        }
        else
        {
            res.status(400).json({error:{global:"token is invalid"}})
        }
    })
    .catch((err) => res.status(400).json({error:{global:"something went wrong while fetching data"}}))
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

export const updateCustomer = async (req,res) => {
    const id = req.query.id;
    const { data } = req.body;
    if(data.customer_img) {
        console.log("entered customer image decode")
        let customerImg = "";
        let dateVal = Date.now();
        await decode(data.customer_img, { fname: './uploads/'+ dateVal.toString() + "customer", ext: 'jpg' });
        customerImg = '/uploads/'+ dateVal.toString() + "customer"+".jpg";
        data['customer_img'] = customerImg;
    }

    Customer.updateOne({_id: id}, {$set: data}).exec().then((customerRecord)=>{
        res.status(200).json({success:{global:"Customer details is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const updatePass = async (req,res) => {
    const { restData } = req.body

    Customer.findOneAndUpdate(
        { _id: restData.id },
        { password: restData.password },
        { useFindAndModify: false }
    )
    .exec()
    .then((data) => {
                    res.status(200).json({success:{global:"password updated successfully"}})
    })
    .catch((err) => res.status(200).json({success:{global:"could not find data"}}))
    
    // Customer.findByIdAndUpdate({_id: restData.id}, restData, (err, data) => {
    //     if(err) {
    //      console.log("error is:"+err)   
    //     }
    //     else {
    //         if(data) {
    //             data.password = bcrypt.hashSync(restData.password, 10)
    //             data.save(function (errors, user) {
    //                 if (errors) {
    //                     console.log("error while updating is :"+errors)
    //                     res.status(400).json({error:{global:"something went wrong while updating"}})
    //                 } else {
    //                     res.status(200).json({success:{global:"password updated successfully"}})        
    //                 }
    //               });
    //         }
    //         else {
    //             res.status(200).json({success:{global:"could not find data"}})        
    //         }
    //     }
    // })
}

export const checkUpdPass = (req,res) => {
    const { restData } = req.body

    Customer.findOne({_id: restData.id}).exec().then((customerRecord)=>{
        if(customerRecord && customerRecord.isValidPassword(restData.old_password)){
            Customer.findOneAndUpdate(
                { _id: restData.id },
                { password: restData.password },
                { useFindAndModify: false }
            )
            .exec()
            .then((data) => {
                            res.status(200).json({success:{global:"password updated successfully"}})
            })
            .catch((err) => res.status(200).json({success:{global:"could not find data"}}))      
        }else{
            res.status(400).json({errors:{global:"invalid old password"}});
        }
    }).catch((err) => 
    {
        console.log(err)
        res.status(400).json({errors:{global:"invalid credentials"}})
    }
    );
}

export const delete_Customer = (req,res) => {
    const id = req.params.id;
    Customer.deleteOne({_id: id},function(err,data){
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


export const google_signinUp = (req,res) => {
    const { saveData } = req.body

    Customer.findOne({ 'email': saveData.email }).exec()
    .then((data) => {
        if(data) {
            res.status(200).json({ savedData: data });
        }
        else {
            const customer = new Customer({
                _id:mongoose.Types.ObjectId(),
                email:saveData.email,
                role:saveData.role,
                username: saveData.username,
                active: "yes"
            })
            customer.setPassword(saveData.password)
        
            customer.save().then((data) => {
                res.status(201).json({ savedData: data })
            })
            .catch((err) => {
                console.log("error occured while saving"+err)
                res.status(200).json({success:{global:"could not save data"}})
            })
        }

    })
    .catch((err) => {
        console.log("error while fetching customer")
        res.status(200).json({success:{global:"could not fetch customer"}})
    })


}

export default { add_customer, login, getCustomers, verifyMail, getCustomerById, updateCustomer, delete_Customer, forgotPassword, resetPass, updatePass, checkUpdPass, google_signinUp }