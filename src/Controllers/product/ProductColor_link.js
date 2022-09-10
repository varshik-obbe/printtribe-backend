import mongoose from "mongoose";
import { decode } from 'node-base64-image';
import productsColorLink from "../../models/productColor_link";
import ParseErrors from "../../utils/ParseErrors";

export const add_ProductColorLink = async (req,res)=>{ 
    let { productcolordata } = req.body;
    let dateVal = Date.now();
    if(Array.isArray(productcolordata.color_links) && productcolordata.color_links.length > 0) {
        await Promise.all(productcolordata.color_links.map(async (item,key) => {
            if(Array.isArray(item.imgs) && item.imgs.length > 0) {
                await Promise.all(item.imgs.map(async (itemImg,keyImg) => {
                    await decode(itemImg, { fname: './uploads/'+ dateVal + keyImg + productcolordata.product_id, ext: 'jpg' });
                    productcolordata.color_links[key].imgs[keyImg] = '/uploads/'+ dateVal + keyImg + productcolordata.product_id +".jpg";       
                }))
            }
        }))
    }
    const productColorSave = new productsColorLink({
        _id:mongoose.Types.ObjectId(),
        product_id: productcolordata.product_id,
        color_links: productcolordata.color_links
    })
    productColorSave.save().then((productColorRecord)=>res.status(201).json({productColorRecord}))
    .catch((err)=>res.status(400).json({errors:ParseErrors(err.errors)}));
}

export const getProductColorLinkById = (req,res) => {
    const id = req.params.id;
    productsColorLink.findOne({'product_id': id})
    .exec()
    .then((data) => {
        if(data) {
            res.status(200).json({productColorData: data})
        }
        else {
            res.status(400).json({error:{global:{error: "something went wrong" }}});    
        }
    })
    .catch((err) => {
        res.status(400).json({error:{global:"something went wrong"}});
    })    
}

export const getColorLinkProducts = (req,res) => {
    productsColorLink.find()
    .exec()
    .then((productsColorLinkData)=>{
        const response = {
            count:productsColorLinkData.length,
            productColorLinks: productsColorLinkData.map((productcolorlinkres)=>({
                    id:productcolorlinkres._id,
                    product_id: productcolorlinkres.product_id,
                    color_links: productcolorlinkres.color_links
                }))
        }
        res.status(200).json({productColorLinkData:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const updateProductColorLinks = async (req,res) => {
    const id = req.query.id;
    const { data } = req.body;
    let dateVal = Date.now();
    if(Array.isArray(data.color_links) && data.color_links.length > 0) {
        await Promise.all(data.color_links.map(async (item,key) => {
            if(Array.isArray(item.imgs) && item.imgs.length > 0) {
                await Promise.all(item.imgs.map(async (itemImg,keyImg) => {
                    await decode(itemImg, { fname: './uploads/'+ dateVal + keyImg + data.product_id, ext: 'jpg' });
                    data.color_links[key].imgs[keyImg] = '/uploads/'+ dateVal + keyImg + data.product_id +".jpg";       
                }))
            }
        }))
    }
    productsColorLink.updateOne({product_id: data.product_id}, {$set: data}).exec().then((fabricProductsData)=>{
        res.status(200).json({success:{global:"Product Color Links is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const deleteProductColorLink = (req,res) => {
    const id = req.params.id;
    productsColorLink.deleteOne({_id: id},function(err,data){
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


export default { add_ProductColorLink, getProductColorLinkById, getColorLinkProducts, updateProductColorLinks, deleteProductColorLink }