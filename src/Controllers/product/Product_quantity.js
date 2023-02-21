import mongoose from "mongoose";
import ProductsModel from "../../models/products";
import productQuantModel from "../../models/product_quantity";
import quantityLogModel from "../../models/quantity_log";
import ParseErrors from "../../utils/ParseErrors";

export const add_quantities = (req,res) => {
    const { productsData } = req.body;


    const productsQuantData = new productQuantModel({
        _id: mongoose.Types.ObjectId(),
        product_id: productsData.product_id,
        variants: productsData.variants,
        color_code: productsData.color_code
    })

    productsQuantData.save().then((savedata) => {
        ProductsModel.updateOne({ '_id': productsData.product_id }, { $set: { 'quantities_updated': true } })
        .then((updatedData) => {
            res.status(201).json({ saveddata: savedata })
        })
        .catch((err) => {
            console.log("could not update product"+err)
            res.status(400).json({ global: { error: "could not update product" } })
        })
    })
    .catch((err) => res.status(400).json({ errors: ParseErrors(err.errors) }))
}

export const updateProductsQuant = (req,res) => {
    const prod_id = req.query.id;
    const data = req.body;


    productQuantModel.updateOne({'product_id': prod_id}, {$set: {"variants": data.productsData.variants}}).exec().then((productRecord)=>{
        res.status(201).json({success:{global:"updated successfully"}});
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong while updating colors and sizes"}});
    })                        
}

export const getQuantById = (req,res) => {
    const prod_id = req.params.id;

    productQuantModel.findOne({'product_id': prod_id})
    .exec()
    .then((resultdata) => {
        res.status(201).json({ data: resultdata })
    })
    .catch((err) => res.status(500).json({error:{global:"something went wrong while fetching data"}}))
}

export const getQuantByColorSize = (req,res) => {
    const prod_id = req.params.product_id;
    const size = req.params.size;
    const color = req.params.color;

    let responseObject = {};

    productQuantModel.findOne({'product_id': prod_id})
    .exec()
    .then(async (resultdata) => {
        await Promise.all(resultdata.variants.map((item,key) => {
            if(item.color == color && item.size == size) {
                responseObject = item
            }
        }))

        res.status(200).json({ data: responseObject })
    })
    .catch((err) => res.status(500).json({error:{global:"could not fetch data"}}))
}

export const updateQuant = (req,res) => {
    const { updateData } = req.body;
    if(updateData.product_id && updateData.color && updateData.size) {
        productQuantModel.updateOne(
            { 'product_id': updateData.product_id, variants: { $elemMatch: { color: updateData.color, size: updateData.size  } } },
            { $set: { "variants.$.quantity": updateData.quantity } }
         )
         .exec()
         .then(async (updatedData) => {
             await updatedLog(updateData);
             res.status(201).json({ success: { global: "updated successfully" } })
         })
         .catch((err) => res.status(500).json({error:{global:"could not update data"}}))
        // productQuantModel.updateOne({'product_id': updateData.product_id, 'variants.color': updateData.color, 'variants.size': updateData.size}, { $set: { 'variants.$.quantity': updateData.quantity } })


        // productQuantModel.findOneAndUpdate({'product_id': updateData.product_id}, 
        //     { 
        //       "$set": {"variants.$[quantity]": updateData.quantity} 
        //     },
        //     { 
        //       "arrayFilters": [{ "variants.color": updateData.color}, { 'variants.size': updateData.size }]
        //     })
            // .then((updatedData) => {
            //     res.status(200).json({success:{global:"User details is updated successfully"}})
            // })
            // .catch((err) => res.status(400).json({error:{global:"something went wrong while updating"+err}}))
    } 
    else {
        res.status(500).json({error:{global:"product_id or color or size is not provided"}})
    }
}


async function updatedLog(updateData)  {


    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();


    const updatdeDate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    const updatedLogSave = new quantityLogModel({
        _id: mongoose.Types.ObjectId(),
        product_id: updateData.product_id,
        color: updateData.color,
        color_code: updateData.color_code,
        size: updateData.size,
        user_id: updateData.user_id,
        email: updateData.email,
        updated_quant: updateData.updated_quant,
        action: updateData.action,
        remarks: updateData.remark,
        time: updatdeDate.toString(),
        user_type: "admin"
    })

    await updatedLogSave.save().then((savedata) => {
        console.log("log added successfully");
        return "success";
    })
    .catch((err) => {
        console.log("error saving log data "+err)
        return "fail";
    })

}

export const getAllQuantLogs = (req,res) => {
    const product_id = req.params.id

    quantityLogModel.find({ 'product_id': product_id })
    .exec()
    .then((logdata) => {
        res.status(200).json({ logData: logdata })
    })
    .catch((err) => {
        res.status(500).json({error:{global:"logs could not be fetched"}})
    })
}

export const deleteQuantItem = (req,res) => {
    const id = req.params.id;
    productQuantModel.deleteOne({'product_id': id},function(err,data){
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

export default { add_quantities, getQuantById, getQuantByColorSize, updateProductsQuant, updateQuant, deleteQuantItem, getAllQuantLogs }