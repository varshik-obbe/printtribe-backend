import mongoose from "mongoose";
import productQuantModel from "../../models/product_quantity";
import ParseErrors from "../../utils/ParseErrors";

export const add_quantities = (req,res) => {
    const { productsData } = req.body;


    const productsQuantData = new productQuantModel({
        _id: mongoose.Types.ObjectId(),
        product_id: productsData.product_id,
        variants: productsData.variants
    })

    productsQuantData.save().then((savedata) => {
        res.status(201).json({ saveddata: savedata })
    })
    .catch((err) => res.status(400).json({ errors: ParseErrors(err.errors) }))
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
        productQuantModel.updateOne({'product_id': updateData.product_id, 'variants.color': updateData.color, 'variants.size': updateData.size}, { $set: { 'variants.$.quantity': updateData.quantity } })


        // productQuantModel.findOneAndUpdate({'product_id': updateData.product_id}, 
        //     { 
        //       "$set": {"variants.$[quantity]": updateData.quantity} 
        //     },
        //     { 
        //       "arrayFilters": [{ "variants.color": updateData.color}, { 'variants.size': updateData.size }]
        //     })
            .then((updatedData) => {
                res.status(200).json({success:{global:"User details is updated successfully"}})
            })
            .catch((err) => res.status(400).json({error:{global:"something went wrong while updating"+err}}))
    } 
    else {
        res.status(500).json({error:{global:"product_id or color or size is not provided"}})
    }
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

export default { add_quantities, getQuantById, getQuantByColorSize, updateQuant, deleteQuantItem }