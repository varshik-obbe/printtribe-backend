import mongoose from "mongoose";
import customerModel from "../models/customers";

export default async function (customer_id, sessionId, store) {
    let result = false;
    customerModel.updateOne({ _id: customer_id }, { $set: { 'shopify_access_token': sessionId, 'customer_shopify': 'yes', 'shopify_store': store } })
    .then((updateData) => {
        return true; 
      })
      .catch((err) => {
        console.log("error occured while updating customer"+err)
        return false;
      })
}