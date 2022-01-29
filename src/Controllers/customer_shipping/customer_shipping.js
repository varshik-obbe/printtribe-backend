import mongoose from "mongoose";
import customerShipping from "../../models/customer_shipping";
import ParseErrors from "../../utils/ParseErrors";


export const add_shipping = (req,res) => {
    const { shipping_data } = req.body

    const shippingSavedata = new customerShipping({
        _id: mongoose.Types.ObjectId(),
        customer_id: shipping_data.customer_id,
        visitor_id: shipping_data.visitor_id,
        fullname: shipping_data.fullname,
        address1: shipping_data.address1,
        address2: shipping_data.address2,
        country: shipping_data.country,
        zip_code: shipping_data.zip_code,
        state: shipping_data.state,
        company: shipping_data.company,
        phone: shipping_data.phone,
        shipping_charges: shipping_data.shipping_charges,
        city: shipping_data.city
    })

    shippingSavedata.save().then((saveddata) => {
        res.status(201).jsonp({saveddata})
    })
    .catch((err) => res.status(400).json({ errors: ParseErrors(err.errors) }))
}

export const getSingle_shipping = (req,res) => {
    const id = req.params.id
    customerShipping.findOne({'visitor_id': id})
    .then((data) => {
        res.status(200).json({shipping_data:data});
    })
    .catch((err) => res.status(400).json({ errors: ParseErrors(err.errors) }))
}

export const delete_shipping = (req,res) => {
    const id = req.params.id;
    customerShipping.deleteOne({_id: id},function(err,data){
        if(err){
            console.log(err);
            res.send('error');
        }
        else
        {
            return res.send('success')
        }
    });
}


export default { add_shipping, getSingle_shipping, delete_shipping }