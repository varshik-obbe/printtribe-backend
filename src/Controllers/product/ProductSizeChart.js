import mongoose from "mongoose";
import productSizeChart from "../../models/productSizechart";
import ParseErrors from "../../utils/ParseErrors";

export const add_ProductSizeChart = (req,res)=>{ 
    let { productsizechartdata } = req.body;

    const productsizechartSave = new productSizeChart({
        _id:mongoose.Types.ObjectId(),
        product_id: productsizechartdata.product_id,
        centimeters: productsizechartdata.centimeters,
        inches: productsizechartdata.inches
    })
    productsizechartSave.save().then((productsizechartData)=>res.status(201).json({productsizechartData}))
    .catch((err)=>res.status(400).json({errors:ParseErrors(err.errors)}));
}

export const getProductSizeChartById = (req,res) => {
    const id = req.params.id;
    productSizeChart.findOne({'product_id': id})
    .exec()
    .then((data) => {
        if(data) {
            res.status(200).json({productSizeChartData: data})
        }
        else {
            res.status(400).json({error:{global:{error: "something went wrong" }}});    
        }
    })
    .catch((err) => {
        res.status(400).json({error:{global:"something went wrong"}});
    })    
}

export const getSizeChartProducts = (req,res) => {
    productSizeChart.find()
    .exec()
    .then((productsizeChartData)=>{
        const response = {
            count:productsizeChartData.length,
            productsizeChartData: productsizeChartData.map((productsizechartres)=>({
                    id:productsizechartres._id,
                    product_id: productsizechartres.product_id,
                    centimeters: productsizechartres.centimeters,
                    inches: productsizechartres.inches
                }))
        }
        res.status(200).json({productsizeChartData:response});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 
}

export const updateProductSizeChart = (req,res) => {
    const id = req.query.id;
    const { data } = req.body;
    productSizeChart.updateOne({product_id: data.product_id}, {$set: data}).exec().then((fabricProductsData)=>{
        res.status(200).json({success:{global:"Product Color Links is updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const deleteProductSizeChart = (req,res) => {
    const id = req.params.id;
    productSizeChart.deleteOne({_id: id},function(err,data){
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

export default { add_ProductSizeChart, getProductSizeChartById, getSizeChartProducts, updateProductSizeChart, deleteProductSizeChart }