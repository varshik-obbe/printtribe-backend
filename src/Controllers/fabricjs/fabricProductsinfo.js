import mongoose from "mongoose";
import { decode } from 'node-base64-image';
import fabricProducts from "../../models/fabricProductInfo";
import ParseErrors from "../../utils/ParseErrors";
//import zakekeCSV from '../../utils/ZakekeCreateCSV';


export const add_ProductInfo = async (req,res)=>{
    let { productdata } = req.body;
    console.log(productdata);
    if(Array.isArray(productdata.variant) && productdata.variant.length > 0) {
        await Promise.all(productdata.variant.map(async (item,key) => {
            let dateVal = Date.now();
            await Promise.all(item.variantNames.map(async (itemsSub, keySub) => {
                if(itemsSub == "front") {
                    await decode(item.frontImgURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "front" + productdata.productId, ext: 'jpg' });
                    productdata.variant[key]['frontImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "front" + productdata.productId +".jpg";
                }
                else if(itemsSub == "back") {
                    await decode(item.backImgURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "back" + productdata.productId, ext: 'jpg' });
                    productdata.variant[key]['backImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "back" + productdata.productId +".jpg";
                }
                else if(itemsSub == "left") {
                    await decode(item.leftImgURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "left" + productdata.productId, ext: 'jpg' });
                    productdata.variant[key]['leftImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "left" + productdata.productId +".jpg";                   
                }
                else if(itemsSub == "right") {
                    await decode(item.rightImgURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "right" + productdata.productId, ext: 'jpg' });
                    productdata.variant[key]['rightImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "right" + productdata.productId +".jpg";
                }
            }))
        }))
    }
    console.log(productdata);
    // zakekeCSV(productdata.productId, productdata.variant);
    const fabricsProduct = new fabricProducts({
        _id:mongoose.Types.ObjectId(),
        productId: productdata.productId,
        variant: productdata.variant
    })
    fabricsProduct.save().then((fabricProductRecord)=>res.status(201).json({fabricProductRecord}))
    .catch((err)=>res.status(400).json({errors:ParseErrors(err.errors)}));
}

export const getProductById = (req,res) => {
    const id = req.params.id;
    fabricProducts.findOne({'productId': id})
    .exec()
    .then((data) => {
        if(data) {
            res.status(200).json({productData: data})
        }
        else {
            res.status(400).json({error:{global:{error: "something went wrong" }}});    
        }
    })
    .catch((err) => {
        res.status(400).json({error:{global:"something went wrong"}});
    })    
}

export const get_isFabricProduct = (req,res) => {
    const id = req.params.id;
    fabricProducts.findOne({'productId': id})
    .exec()
    .then((data) => {
        if(data) {
            res.status(200).json({success: true, message: 'this is a fabric customizable product'})
        }
        else {
            res.status(400).json({error:{global:"this is not a fabric customizable product"}});    
        }
    })
    .catch((err) => {
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const getProducts = (req,res) => {
    fabricProducts.find()
    .exec()
    .then((fabricProductsData)=>{
        const response = {
            count:fabricProductsData.length,
            fabricproducts: fabricProductsData.map((fabricProductsres)=>({
                    id:fabricProductsres._id,
                    productId: fabricProductsres.productId,
                    variant: fabricProductsres.variant
                }))
        }
        res.status(200).json({fabricProductsData:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const updateFabricProducts = async (req,res) => {
    const id = req.query.id;
    const { data } = req.body;
    if(Array.isArray(data.variant) && data.variant.length > 0) {
        await Promise.all(data.variant.map(async (item,key) => {
            let dateVal = Date.now();
            if(item.variantNames) {
                await Promise.all(item.variantNames.map(async (itemsSub, keySub) => {
                    if(itemsSub == "front") {
                        await decode(item.frontImgEncodeURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "front" + productdata.productId, ext: 'jpg' });
                        data.variant[key]['frontImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "front" + productdata.productId +".jpg";
                    }
                    else if(itemsSub == "back") {
                        await decode(item.backImgEncodeURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "back" + productdata.productId, ext: 'jpg' });
                        data.variant[key]['backImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "back" + productdata.productId +".jpg";
                    }
                    else if(itemsSub == "left") {
                        await decode(item.leftImgEncodeURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "left" + productdata.productId, ext: 'jpg' });
                        data.variant[key]['leftImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "left" + productdata.productId +".jpg";                   
                    }
                    else if(itemsSub == "right") {
                        await decode(item.rightImgEncodeURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "right" + productdata.productId, ext: 'jpg' });
                        data.variant[key]['rightImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "right" + productdata.productId +".jpg";
                    }
                }))
            }
        }))
    }
    fabricProducts.updateOne({productId: data.productId}, {$set: data}).exec().then((fabricProductsData)=>{
        res.status(200).json({success:{global:"Product details is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const deleteFabricProduct = (req,res) => {
    const id = req.params.id;
    fabricProducts.deleteOne({_id: id},function(err,data){
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

export default { add_ProductInfo, getProducts, getProductById, updateFabricProducts,deleteFabricProduct, get_isFabricProduct }