import customerProductsModel from "../../models/customer_inventory_products";

export const addProduct = (req,res) => {
    const { productData } = req.body;

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


export default { addProduct, removeProduct }