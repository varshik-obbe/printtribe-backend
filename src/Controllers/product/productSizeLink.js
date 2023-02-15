import mongoose from "mongoose";
import productsSizeLink from "../../models/productsSizeLink";
import ParseErrors from "../../utils/ParseErrors";

export const add_ProductSizeLink = (req,res)=>{ 
    let { productsizedata } = req.body;
    console.log("data is", productsizedata)
    const productSizeSave = new productsSizeLink({
        _id:mongoose.Types.ObjectId(),
        product_id: productsizedata.product_id,
        size_link: productsizedata.size_link
    })
    productSizeSave.save().then((productSizeRecord)=>res.status(201).json({productSizeRecord}))
    .catch((err)=>res.status(400).json({errors:ParseErrors(err.errors)}));
}

export const getProductSizeLinkById = (req,res) => {
    const id = req.params.id;
    productsSizeLink.findOne({'product_id': id})
    .exec()
    .then((data) => {
        if(data) {
            res.status(200).json({productSizeData: data})
        }
        else {
            res.status(400).json({error:{global:{error: "something went wrong" }}});    
        }
    })
    .catch((err) => {
        res.status(400).json({error:{global:"something went wrong"}});
    })    
}

export const getSizeLinkProducts = (req,res) => {
    productsSizeLink.find()
    .exec()
    .then((productsSizeLinkData)=>{
        const response = {
            count:productsSizeLinkData.length,
            productSizeLinks: productsSizeLinkData.map((productsizelinkres)=>({
                    id:productsizelinkres._id,
                    product_id: productsizelinkres.product_id,
                    size_link: productsizelinkres.size_link
                }))
        }
        res.status(200).json({productSizeLinkData:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const updateProductSizeLinks = async (req,res) => {
    const id = req.query.id;
    const { data } = req.body;
    productsSizeLink.updateOne({product_id: data.product_id}, {$set: data}).exec().then((fabricProductsData)=>{
        res.status(200).json({success:{global:"Product Size Links is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const deleteProductSizeLink = (req,res) => {
    const id = req.params.id;
    productsSizeLink.deleteOne({"product_id": id},function(err,data){
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


export default { add_ProductSizeLink, getProductSizeLinkById, getSizeLinkProducts, updateProductSizeLinks, deleteProductSizeLink }