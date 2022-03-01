import mongoose from "mongoose";
import { decode } from 'node-base64-image';
import ZakekeProducts from "../../models/zakekeProductInfo";
import ParseErrors from "../../utils/ParseErrors";
import zakekeCSV from '../../utils/ZakekeCreateCSV';


export const add_ProductInfo = async (req,res)=>{
    let { productdata } = req.body;
    console.log(productdata);
    if(Array.isArray(productdata.variant) && productdata.variant.length > 0) {
        await Promise.all(productdata.variant.map(async (item,key) => {
            let dateVal = Date.now();
            await Promise.all(item.variantNames.map(async (itemsSub, keySub) => {
                if(itemsSub == "front") {
                    await decode(item.frontImgURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "front" + productdata.productId, ext: 'jpg' });
                    await decode(item.frontImgMask, {fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "frontMaskImg" + productdata.productId, ext: 'jpg'});
                    productdata.variant[key]['frontImgMask'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "frontMaskImg" + productdata.productId +".jpg";
                    productdata.variant[key]['frontImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "front" + productdata.productId +".jpg";
                }
                else if(itemsSub == "back") {
                    await decode(item.backImgURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "back" + productdata.productId, ext: 'jpg' });
                    await decode(item.backImgMask, {fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "backMaskImg" + productdata.productId, ext: 'jpg'});
                    productdata.variant[key]['backImgMask'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "backMaskImg" + productdata.productId +".jpg";
                    productdata.variant[key]['backImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "back" + productdata.productId +".jpg";
                }
                else if(itemsSub == "left") {
                    await decode(item.leftImgURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "left" + productdata.productId, ext: 'jpg' });
                    await decode(item.leftImgMask, {fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "leftMaskImg" + productdata.productId, ext: 'jpg'});
                    productdata.variant[key]['leftImgMask'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "leftMaskImg" + productdata.productId +".jpg";
                    productdata.variant[key]['leftImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "left" + productdata.productId +".jpg";                   
                }
                else if(itemsSub == "right") {
                    await decode(item.rightImgURL, { fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "right" + productdata.productId, ext: 'jpg' });
                    await decode(item.rightImgMask, {fname: './uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "rightMaskImg" + productdata.productId, ext: 'jpg'});
                    productdata.variant[key]['rightImgMask'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "rightMaskImg" + productdata.productId +".jpg";
                    productdata.variant[key]['rightImgURL'] = '/uploads/'+ dateVal + item.colorName.replace(/ |'/g,"_") + "right" + productdata.productId +".jpg";
                }
            }))
        }))
    }
    console.log(productdata);
    zakekeCSV(productdata.productId, productdata.variant);
    const zakekeProduct = new ZakekeProducts({
        _id:mongoose.Types.ObjectId(),
        productId: productdata.productId,
        variant: productdata.variant
    })
    zakekeProduct.save().then((zakekeProductRecord)=>res.status(201).json({zakekeProductRecord}))
    .catch((err)=>res.status(400).json({errors:ParseErrors(err.errors)}));
}

export const get_isZakekeProduct = (req,res) => {
    const id = req.params.id;
    ZakekeProducts.findOne({'productId': id})
    .exec()
    .then((data) => {
        if(data) {
            res.status(200).json({success: true, message: 'this is a zakeke customizable product'})
        }
        else {
            res.status(400).json({error:{global:"this is not a zakeke customizable product"}});    
        }
    })
    .catch((err) => {
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const getProducts = (req,res) => {
    ZakekeProducts.find()
    .exec()
    .then((zakekeProductsData)=>{
        const response = {
            count:zakekeProductsData.length,
            zakekeproducts: zakekeProductsData.map((zakekeProductsres)=>({
                    id:zakekeProductsres._id,
                    productId: zakekeProductsres.productId,
                    variant: zakekeProductsres.variant
                }))
        }
        res.status(200).json({zakekeProductsData:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const updateZakekeProducts = (req,res) => {
    const id = req.query.id;
    const { data } = req.body;
    let variant_id = "";
    if(data.variant._id)
    {
        variant_id = data.variant._id
    }
    console.log('variant id is:'+variant_id);
    ZakekeProducts.updateOne({_id: id, "variant._id": variant_id}, {$set: data}).exec().then((zakekeProductsData)=>{
        res.status(200).json({success:{global:"User details is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const deleteZakekeProduct = (req,res) => {
    const id = req.params.id;
    ZakekeProducts.deleteOne({_id: id},function(err,data){
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

export default { add_ProductInfo, getProducts, updateZakekeProducts,deleteZakekeProduct, get_isZakekeProduct }