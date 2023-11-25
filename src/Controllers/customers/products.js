import customerInventoryModel from "../../models/customer_inventory_products"
import fabricdesignModel from "../../models/fabricDesigns"


export const get_Products = async (req,res) => {
    const custId = req.params.id

    let customerProdData = await customerInventoryModel.find({'customer_id':custId})
    .exec()
    .then((data) => {
        let response = data.map((custData) => ({
            _id: custData._id,
            product_id: custData.product_id,
            title: custData.title,
            description: custData.description,
            price: custData.price,
            productsize: custData.productsize,
            productcolor: custData.productcolor,
            product_img: custData.product_img,
            category_id: custData.category_id,
            quantity: custData.quantity,
            zakeke_price: custData.zakeke_price,
            designID: custData.designID,
            customer_id: custData.customer_id,
            design_url: "",
            shopify_prod: custData.shopify_prod ? custData.shopify_prod : "",
            shopify_inventory_id: custData.shopify_inventory_id ? custData.shopify_inventory_id : "",
            shopify_prod_id: custData.shopify_prod_id ? custData.shopify_prod_id : "",
            createdAt: custData.createdAt,
            updatedAt: custData.updatedAt
        }))
        return response;
    })
    .catch((err) => res.status(500).json({error:{global:"could not fetch data"+err}}))

    if(Array.isArray(customerProdData) && customerProdData.length) {
        await Promise.all(customerProdData.map(async (val, index) => {
            let designData = await fabricdesignModel.findOne({ 'productId': val.product_id, 'color': val.productcolor, 'side': "one", 'customerId': val.customer_id })
            .exec()
            .then(async (desData) => {
                if(desData) {
                    customerProdData[index]["design_url"] = desData.url;
                }
                else {
                    customerProdData[index]["design_url"] = "";
                }
            })
            .catch((err) => console.log("error getting the design", err));
        }))
    }
    res.status(201).json({ products: customerProdData })
}

export default { get_Products }