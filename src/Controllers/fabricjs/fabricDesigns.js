import mongoose from "mongoose";
import { decode } from 'node-base64-image';
import FabricDesignModel from "../../models/fabricDesigns";
import fabricSavedDesigns from "../../models/fabricSavedDesigns";
import fabricDesignWithProductModel from "../../models/fabricDesignWithProduct";


export const add_Desing = async (req, res) => {
    let { data } = req.body;
    let dateVal = Date.now();
    await Promise.all(data.imgsArr.map(async (item, key) => {
        await decode(item, { fname: './uploads/'+ dateVal + data.productId + key, ext: 'jpg' });
        data.imgsArr[key] = '/uploads/'+ dateVal + data.productId + key +".jpg";
    }))
    const fabricDesign = new FabricDesignModel({
        _id: mongoose.Types.ObjectId(),
        productId: data.productId,
        customerId: data.customerId,
        color: data.color,
        side: data.side,
        data: data.data,
        url: data.url,
        imgUrl: data.imgUrl,
        uploadedImgsArr: data.imgsArr,
        textDesign: data.textDesign,
        savedImgsInfo: data.savedImgsInfo
    });

    fabricDesign.save().then((savedData) => {
        res.status(201).json({ data: savedData })
    })
    .catch((err) => res.status(400).json({global: {error: "could not add the data"} }))
}

export const addSaved_Design = async (req, res) => {
    let { data } = req.body;

    let dateVal = Date.now();
    await Promise.all(data.imgsArr.map(async (item, key) => {
        await decode(item, { fname: './uploads/'+ dateVal + data.productId + key, ext: 'png' });
        data.imgsArr[key] = '/uploads/'+ dateVal + data.productId + key +".png";
    }))
    const fabricSavedDesign = new fabricSavedDesigns({
        _id: mongoose.Types.ObjectId(),
        productId: data.productId,
        customerId: data.customerId,
        imgsArr: data.imgsArr
    });

    fabricSavedDesign.save().then((savedData) => {
        res.status(201).json({ data: savedData })
    })
    .catch((err) => res.status(400).json({global: {error: "could not add the data"} }))
}

export const saveProductWithDesign = (req,res) => {

    let { data } = req.body;

    const fabricDesign = new fabricDesignWithProductModel({
        _id: mongoose.Types.ObjectId(),
        productId: data.productId,
        customerId: data.customerId,
        name: data.name,
        description: data.description,
        color: data.color,
        side: data.side,
        size: data.size,
        price: data.price,
        img: data.img,
        design_price: data.design_price,
        design_img: data.design_img,
        gst: data.gst,
        design_gst: data.design_gst,
        data: data.data,
        imgsArr: data.imgsArr,
        savedImgsInfo: data.savedImgsInfo,
        textDesign: data.textDesign
    });

    fabricDesign.save().then((savedData) => {
        res.status(201).json({ data: savedData })
    })
    .catch((err) => res.status(400).json({global: {error: "could not add the data"} }))
}

export const getAllsaved_design = (req,res) => {
    let customer_id = req.params.id;
    fabricSavedDesigns.find({'customer_id': customer_id})
    .exec()
    .then((designsSaved) => {
        res.status(200).json({ designsSaved })
    })
    .catch((err) => {
        console.log("error occured while fetching"+err)
        res.status(400).json({global: {error: "could not fetch data"} })
    })    
}

export const getAllproductwithDesigns = (req,res) => {
    let customerId = req.params.id;
    fabricDesignWithProductModel.find({'customerId': customerId})
    .exec()
    .then((designsSaved) => {
        res.status(200).json({ designsSaved })
    })
    .catch((err) => {
        console.log("error occured while fetching"+err)
        res.status(400).json({global: {error: "could not fetch data"} })
    })
}

export const get_FabricDesigns = async (req, res) => {
    FabricDesignModel.find()
    .exec()
    .then((fabricData) => {
        res.status(200).json({ fabricData })
    })
    .catch((err) => {
        console.log("error occured while fetching"+err)
        res.status(400).json({global: {error: "could not fetch data"} })
    })
}

export const get_FabricDesignByfilter = async (req,res) => {
    let product_id = req.params.id;
    let color = req.params.color;
    let side = req.params.side;
    let customerId = req.params.customerId;

    FabricDesignModel.findOne({ 'productId': product_id, 'color': color, 'side': side, 'customerId': customerId })
    .exec()
    .then((data) => {
        if(data) {
            res.status(200).json({ fabricData: data })
        }
        else {
            res.status(200).json({ })
        }
    })
    .catch((err) => res.status(400).json({ global: { error: "error occured while fetching" } }))
}

export const update_categories = async (req,res) => {
    let data = req.body.data;
    const id = data.id;
    if(data.name) {
        data.category = data.name
    }
    if(data.img) {
        let dateVal = Date.now();
        await decode(data.img, { fname: './uploads/'+ dateVal + data.name.replace(/ |'/g,"_").toLowerCase(), ext: data.extension });
        data.img = '/uploads/'+ dateVal + data.name.replace(/ |'/g,"_")+"."+data.extension
    }
    Categories.updateOne({_id: id}, {$set: data}).exec().then((userRecord)=>{
        res.status(200).json({success:{global:"Categorie updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const delete_Category = (req,res) => {
    const id = req.params.id;
    Categories.deleteOne({_id: id},function(err,data){
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

export default { add_Desing, addSaved_Design, get_FabricDesigns, get_FabricDesignByfilter, getAllsaved_design, saveProductWithDesign, getAllproductwithDesigns }

