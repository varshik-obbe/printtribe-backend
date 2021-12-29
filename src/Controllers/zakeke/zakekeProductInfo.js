import mongoose from "mongoose";
import ZakekeProducts from "../../models/zakekeProductInfo";
import ParseErrors from "../../utils/ParseErrors";


export const add_ProductInfo = (req,res)=>{
    const { productdata } = req.body;
    console.log(productdata);
    const zakekeProduct = new ZakekeProducts({
        _id:mongoose.Types.ObjectId(),
        productId: productdata.productId,
        variant: productdata.variant
    })
    zakekeProduct.save().then((zakekeProductRecord)=>res.status(201).json({zakekeProductRecord}))
    .catch((err)=>res.status(400).json({errors:ParseErrors(err.errors)}));
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

export default { add_ProductInfo, getProducts, updateZakekeProducts,deleteZakekeProduct }