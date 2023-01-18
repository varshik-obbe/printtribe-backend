import customerProductsModel from "../../models/customer_inventory_products";

export const addProduct = (req,res) => {
    const { productData } = req.body;

    customerProductsModel.updateOne({ 'product_id': productData.id }, { $set: { 'shopify_prod': 'yes' } })
    .then((updateData) => {
      console.log("success response is"+response.data)
      res.status(200).json({ global: { success: "updated data" } })
    })
    .catch((err) => {
      console.log("error occured while updating product"+err)
      res.status(400).json({ global: {error: "error occured while updating product"} })                  
    })
}


export default { addProduct }