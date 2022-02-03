import customerInventoryModel from "../../models/customer_inventory_products"


export const get_Products = (req,res) => {
    const custId = req.params.id

    customerInventoryModel.find({'customer_id':custId})
    .exec()
    .then((data) => {
        res.status(201).json({ products: data })
    })
    .catch((err) => res.status(500).json({error:{global:"could not fetch data"+err}}))
}

export default { get_Products }