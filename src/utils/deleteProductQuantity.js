import mongoose from "mongoose";
import productQuantModel from "../models/product_quantity";
import quantityLogModel from "../models/quantity_log";

export default async function (productsArr,customer_id,email) {
    Promise.all(productsArr.map(async (item, key) => {
        let quantity = "";
        await productQuantModel.findOne({'product_id': item.product_id})
        .exec()
        .then(async (resultdata) => {
            await Promise.all(resultdata.variants.map((itemsub,key) => {
                if(itemsub.color == item.productcolor && itemsub.size == item.productsize) {
                    quantity = itemsub.quantity
                }
            }))
        })
        .catch((err) => {
            console.log("error getting the quant data")
        })

        let newQuant = parseInt(quantity)  - parseInt(item.quantity)

        productQuantModel.updateOne(
            { 'product_id': item.product_id, variants: { $elemMatch: { color: item.productcolor, size: item.productsize  } } },
            { $set: { "variants.$.quantity": newQuant.toString() } }
         )
         .exec()
         .then(async (updatedData) => {
             await updatedLog(item,customer_id,email);
         })
         .catch((err) => {
             console.log("error occured while updating"+err)
         })
    }))
}

async function updatedLog(updateData,customer_id,email)  {


    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();


    const updatdeDate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    const updatedLogSave = new quantityLogModel({
        _id: mongoose.Types.ObjectId(),
        product_id: updateData.product_id,
        color: updateData.productcolor,
        size: updateData.productsize,
        user_id: customer_id,
        email: email,
        updated_quant: updateData.quantity,
        action: "removed",
        time: updatdeDate.toString(),
        user_type: "customer"
    })

    await updatedLogSave.save().then((savedata) => {
        console.log("log added successfully");
        return "success";
    })
    .catch((err) => {
        console.log("error saving log data "+err)
        return "fail";
    })

}