import mongoose from "mongoose";
import { decode } from 'node-base64-image';
import FabricDesignModel from "../../models/fabricDesigns";


export const add_Desing = async (req, res) => {
    let { data } = req.body;
    const fabricDesign = new FabricDesignModel({
        _id: mongoose.Types.ObjectId(),
        productId: data.productId,
        customerId: data.customerId,
        color: data.color,
        side: data.side,
        data: data.data,
        url: data.url,
        imgUrl: data.imgUrl
    });

    fabricDesign.save().then((savedData) => {
        res.status(201).json({ data: savedData })
    })
    .catch((err) => res.status(400).json({global: {error: "could not add the data"} }))
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

export default { add_Desing, get_FabricDesigns, get_FabricDesignByfilter }

