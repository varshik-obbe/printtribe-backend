import e from "express";
import customerProductsModel from "../../models/customer_inventory_products";
import Customer from "../../models/customers";
import shopify_orders from "../../models/shopify_orders";

export const addProduct = async (req,res) => {
    const { productData } = req.body;

    let session;

    await Customer.findOne({ _id: productData.customer_id })
    .exec()
    .then((data) => {
      if(data) {
        session = data.shopify_access_token
      }
      else {
        session = {};
      }
    })
    .catch((err) => {
      res.status(400).json({error:{global:"coluld not send mail"}})
  }) 

    await shopify.rest.AccessScope.all({
      session: session,
    });


    customerProductsModel.updateOne({ 'product_id': productData.id }, { $set: { 'shopify_prod': 'yes', 'shopify_prod_id': productData.shopify_product_id, 'shopify_inventory_id': productData.shopify_inventory_id, 'authorization_code': productData.authorization_code } })
    .then((updateData) => {
      res.status(200).json({ global: { success: "updated data" } })
    })
    .catch((err) => {
      console.log("error occured while updating product"+err)
      res.status(400).json({ global: {error: "error occured while updating product"} })                  
    })
}

export const removeProduct = (req,res) => {
  const { productData } = req.body;

  customerProductsModel.updateOne({ 'product_id': productData.id }, { $set: { 'shopify_prod': 'no' } })
  .then((updateData) => {
    res.status(200).json({ global: { success: "updated data" } })
  })
  .catch((err) => {
    console.log("error occured while updating product"+err)
    res.status(400).json({ global: {error: "error occured while updating product"} })                  
  })
}

export const dataRequest = async (req,res) => {
  let orders = req.body.orders_requested;

  await orders.map((data,ind) => {
    orders[ind] = data.toString();
  })

  await shopify_orders.find({'shopify_order_id': {$in: orders}})
  .then((data) => {
    if(data) {
      res.status(200).json({ global: { success: data } })
    }
    else {
      res.status(200).json({ global: {error: "could not find any orders with those ids"} })
    }
  })
  .catch((err) => res.status(200).json({ global: {error: "error occured while fetching orders"} }))
}

export const dataDelete = async (req,res) => {
  let orders = req.body.orders_to_redact;

  await orders.map((data,ind) => {
    orders[ind] = data.toString();
  })

  shopify_orders.deleteMany({'shopify_order_id': {$in: orders}})
  .then((data) => {
    res.status(200).json({ global: { success: "deleted data" } })
  })
  .catch((err) => res.status(200).json({ global: {error: "error occured while deleting data"} }))
}

export const shopDelete = async (req,res) => {
  let shop = req.body.shop_domain;

  Customer.updateOne({ 'shopify_store': shop }, { $set: { 'customer_shopify': 'no' } })
  .then((updateData) => {
      res.status(200).json({ global: { success: "uninstalled shopify" } }) 
    })
    .catch((err) => res.status(200).json({ global: {error: "error occured while uninstalling shopify"} }))
}


export default { addProduct, removeProduct, dataRequest, dataDelete, shopDelete }