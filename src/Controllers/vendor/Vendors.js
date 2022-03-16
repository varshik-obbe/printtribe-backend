import mongoose from "mongoose";
import Vendor from "../../models/vendor";
import ParseErrors from "../../utils/ParseErrors";


export const add_vendor = (req,res)=>{
    const { vendorRegisterdata } = req.body;
    console.log(vendorRegisterdata);
    const vendor = new Vendor({
        _id:mongoose.Types.ObjectId(),
        companyname:vendorRegisterdata.companyname,
        address1: vendorRegisterdata.address1,
        address2: vendorRegisterdata.address2,
        address3: vendorRegisterdata.address3,
        city: vendorRegisterdata.city,
        state: vendorRegisterdata.state,
        pincode: vendorRegisterdata.pincode,
        phone: vendorRegisterdata.phone,
        products: vendorRegisterdata.products,
        email: vendorRegisterdata.email,
        website: vendorRegisterdata.website,
        buisness_type: vendorRegisterdata.buisness_type,
        gst: vendorRegisterdata.gst,
        pan: vendorRegisterdata.pan,
        account_number: vendorRegisterdata.account_number,
        ifsc: vendorRegisterdata.ifsc,
        bank_name: vendorRegisterdata.bank_name
    })
    vendor.save().then((vendorRecord)=>res.status(201).json({vendorRecord}))
    .catch((err)=>res.status(400).json({errors:ParseErrors(err.errors)}));
}

export const getVendors = (req,res) => {
    Vendor.find()
    .exec()
    .then((vendordata)=>{
        const response = {
            count:vendordata.length,
            vendordata: vendordata.map((vendor)=>({
                    id:vendor._id,
                    companyname:vendor.companyname,
                    address1: vendor.address1,
                    address2: vendor.address2,
                    address3: vendor.address3,
                    city: vendor.city,
                    state: vendor.state,
                    pincode: vendor.pincode,
                    phone: vendor.phone,
                    products: vendor.products,
                    email: vendor.email,
                    website: vendor.website,
                    buisness_type: vendor.buisness_type,
                    gst: vendor.gst,
                    pan: vendor.pan,
                    account_number: vendor.account_number,
                    ifsc: vendor.ifsc,
                    bank_name: vendor.bank_name
                }))
        }
        res.status(200).json({vendordata:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const getVendorsByPage = async (req,res) => {
    const index = parseInt(req.query.index);
    const limit = parseInt(req.query.limit);
    
    let totalCount = await Vendor.countDocuments().exec();

    Vendor.find()
    .skip(index)
    .limit(limit)
    .exec()
    .then((vendordata)=>{
        const response = {
            count:totalCount,
            vendordata: vendordata.map((vendor)=>({
                    id:vendor._id,
                    companyname:vendor.companyname,
                    address1: vendor.address1,
                    address2: vendor.address2,
                    address3: vendor.address3,
                    city: vendor.city,
                    state: vendor.state,
                    pincode: vendor.pincode,
                    phone: vendor.phone,
                    products: vendor.products,
                    email: vendor.email,
                    website: vendor.website,
                    buisness_type: vendor.buisness_type,
                    gst: vendor.gst,
                    pan: vendor.pan,
                    account_number: vendor.account_number,
                    ifsc: vendor.ifsc,
                    bank_name: vendor.bank_name
                }))
        }
        res.status(200).json({vendordata:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const getVendorById = (req,res)=>{
    const id = req.query.id;
    Vendor.findById(id).exec().then((vendorRecordData)=>{
        res.status(200).json({vendorRecordData})
    }).catch((err)=>{
        res.status(404).json({error:{global:"not found"}});
    });
}

export const updateVendor = (req,res) => {
    const id = req.query.id;
    const { data } = req.body;
    Vendor.updateOne({_id: id}, {$set: data}).exec().then((vendorRecord)=>{
        res.status(200).json({success:{global:"User details is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const delete_Vendor = (req,res) => {
    const id = req.params.id;
    Vendor.deleteOne({_id: id},function(err,data){
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

export const search_vendors = (req,res) => {
    const text = req.params.text

    let title = new RegExp(text)

    Vendor.find({
        "$or": [
            { companyname: { '$regex':  title, '$options': 'i'} },
            { city: { '$regex':  title, '$options': 'i'} },
            { products: { '$regex':  title, '$options': 'i'} },
        ]
    })
    .exec()
    .then(async (data) => {
        let vendordata = await Promise.all(data.map((vendor)=>({
            id:vendor._id,
            companyname:vendor.companyname,
            address1: vendor.address1,
            address2: vendor.address2,
            address3: vendor.address3,
            city: vendor.city,
            state: vendor.state,
            pincode: vendor.pincode,
            phone: vendor.phone,
            products: vendor.products,
            email: vendor.email,
            website: vendor.website,
            buisness_type: vendor.buisness_type,
            gst: vendor.gst,
            pan: vendor.pan,
            account_number: vendor.account_number,
            ifsc: vendor.ifsc,
            bank_name: vendor.bank_name
        })))
        res.status(200).json({ vendors: vendordata })
    })
    .catch((err) => {
        res.status(400).json({error:{global:"could not find the products"}});
    })
}

export default { add_vendor, getVendors, getVendorById, updateVendor, delete_Vendor, search_vendors, getVendorsByPage }