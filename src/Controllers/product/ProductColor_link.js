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


export default { add_ProductColorLink }