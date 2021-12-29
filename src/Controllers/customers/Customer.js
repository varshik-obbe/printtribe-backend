import mongoose from "mongoose";
import Customer from "../../models/customers";
import ParseErrors from "../../utils/ParseErrors";


export const add_customer = (req,res)=>{
    const { customerRegisterdata } = req.body;
    console.log(customerRegisterdata);
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
        bank_name: customerRegisterdata.bank_name
    });
    customer.setPassword(customerRegisterdata.password)
    customer.save().then((customerRecord)=>res.status(201).json({customerRecord}))
    .catch((err)=>res.status(400).json({errors:ParseErrors(err.errors)}));
}

export const login = (req,res) => {
    const { credentials } = req.body;
    const todayDate = new Date();
    
    Customer.findOne({email: credentials.email,role: credentials.role }).exec().then((customerRecord)=>{
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
                    bank_name: customer.bank_name                    
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

export const updateCustomer = (req,res) => {
    const id = req.query.id;
    const { data } = req.body;
    Customer.updateOne({_id: id}, {$set: data}).exec().then((customerRecord)=>{
        res.status(200).json({success:{global:"Customer details is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
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

export default { add_customer, login, getCustomers, getCustomerById, updateCustomer, delete_Customer }