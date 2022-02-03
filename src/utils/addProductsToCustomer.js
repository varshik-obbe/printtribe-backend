import mongoose from "mongoose";
import customerInventoryModel from "../models/customer_inventory_products";


export default async function (productsArr,customer_id) {
    await Promise.all(productsArr.map((item, key) => {
        customerInventoryModel.findOne()
        .where('product_id', item.product_id)
        .where('productsize', item.productsize)
        .where('productcolor', item.productcolor)
        .where('customer_id', customer_id)
        .exec()
        .then((data) => {
            if(data) {
                console.log("product already exists")
                let quantity = parseInt(data.quantity, 10) + parseInt(item.quantity, 10)
                customerInventoryModel.updateOne({'product_id': item.product_id, 'productsize': item.productsize, 'productcolor': item.productcolor, 'customer_id': customer_id}, { $set: { 'quantity': quantity } })
                .then((updatedData) => {
                    return true;
                })
                .catch((err) => {
                    console.log("error occured while updating :"+err)
                    return false;
                })
            }
            else {
                console.log("adding new data")
                const customerInventorySave = new customerInventoryModel({
                    _id: mongoose.Types.ObjectId(),
                    product_id: item.product_id,
                    title: item.title,
                    description: item.description,
                    price: item.price,
                    productsize: item.productsize,
                    productcolor: item.productcolor,
                    product_img: item.product_img,
                    category_id: item.category_id,
                    quantity: item.quantity,
                    zakeke_price: item.zakeke_price,
                    designID: item.designID,
                    customer_id: customer_id
                })
                customerInventorySave.save().then((savedData) => {
                    return true;
                })
                .catch((err) => {
                    console.log("error occured while saving to inventory :"+err)
                    return false;
                })
            }
        })
        .catch((errors) => {
            console.log("error occured while fetching products :"+errors)
            return false;
        })
    }))
}