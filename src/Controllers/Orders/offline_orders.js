import axios from "axios";
import mongoose from "mongoose";
import offlineorderModel from "../../models/offline_invoice_orders";
import deleteQuant from "../../utils/deleteProductQuantity";
import getShipToken from "../../utils/GetShiprocketToken";
import ParseErrors from "../../utils/ParseErrors";
import SendMail from "../../utils/SendMail";

export const add_order = async (req,res) => {
    const { orderData } = req.body;

    if(orderData.shiprocket_order) {
        const token = await getShipToken();
        if(token != "") {
            const newOrder = new offlineorderModel({
                _id:mongoose.Types.ObjectId(),
                customerShipping_details: orderData.customerShipping_details,
                product_info: orderData.product_info,
                total_quantity: orderData.total_quantity,
                total_price: orderData.total_price,
                customer_email: orderData.customer_email,
                courier_id: orderData.courier_id,
                shipment_status: "processing",
                shiprocket_awb: "",
                cgst_amount: orderData.cgst_amount,
                sgst_amount: orderData.sgst_amount,
                igst_amount: orderData.igst_amount,
                shiprocket_order: true
            })
            newOrder.save().then(async saveddata => {
                
    
                deleteQuant(orderData.product_info,orderData.admin_id,orderData.customer_email)

    
                let title = "printribe mail"
                let hello = "hello fellow dropshipper"
                let message = "thank you for ordering with us, your order will be shipped to you soon."
                let second_message = "for any further assistance please reach out to us."
                let link = "https://printribe-partner.web.app/#/login";
                SendMail(title,hello,message,second_message,orderData.customer_email,link);
    
                  let newDate = new Date();

                    const nDate = new Date().toISOString('en-US', {
                        timeZone: 'Asia/Calcutta'
                    }).slice(0, 10);
        
                    let shippingProductsArr = [];
        
                    await Promise.all(orderData.product_info.map((item, key) => {
                        let data = {
                            "name": item.title,
                            "sku": item.title+item.productsize+item.productcolor,
                            "units": parseInt(item.quantity, 10),
                            "selling_price": parseInt(item.price, 10),
                            }
        
                            shippingProductsArr.push(data);
                    }))
        
                    const weightTotal = parseInt(orderData.total_quantity) * 0.1; 
        
        
                    let shipRockData = {
                        "order_id": saveddata._id,
                        "order_date": nDate,
                        "pickup_location": process.env.SHIPROCKET_PICKUP_NAME,
                        "billing_customer_name": saveddata.customerShipping_details[0].fullname,
                        "billing_last_name": saveddata.customerShipping_details[0].fullname,
                        "billing_address": saveddata.customerShipping_details[0].address1,
                        "billing_address_2": saveddata.customerShipping_details[0].address2,
                        "billing_city": saveddata.customerShipping_details[0].city,
                        "billing_pincode": saveddata.customerShipping_details[0].zip_code,
                        "billing_state": saveddata.customerShipping_details[0].state,
                        "billing_country": "India",
                        "billing_email": orderData.customer_email,
                        "billing_phone": saveddata.customerShipping_details[0].phone,
                        "shipping_is_billing": true,
                        "order_items": shippingProductsArr,
                        "payment_method": "Prepaid",
                        "shipping_charges": parseInt(saveddata.customerShipping_details[0].shipping_charges),
                        "giftwrap_charges": 0,
                        "transaction_charges": 0,
                        "total_discount": 0,
                        "sub_total": parseInt(orderData.total_price, 10),
                        "length": 10,
                        "breadth": 10,
                        "height": 10,
                        "weight": weightTotal
                    }
        
        
                const Shippingheaders = {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                    var config = {
                    method: 'POST',
                    url: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
                    data: shipRockData,
                    headers: Shippingheaders
                    };
                    
                    await axios(config)
                    .then(async function (response) {
                    await offlineorderModel.updateOne({'_id': saveddata._id}, { $set: {'shipment_ref_id': response.data.shipment_id, 'shipment_ord_id': response.data.order_id} })
                    .then((updateData) => {
                        res.status(201).jsonp({ savedData: saveddata });
                    })
                    .catch((err) => {
                        console.log("couldn't update the order database "+err)
                    })
                    })
                    .catch(function (error) {
                    console.log("error occured while creating shipping order"+error);
                    res.status(400).json({ errors: error })
                    });
                
            })
            .catch((err) => {
                console.log("errors are:"+err)
                res.status(400).json({ errors: ParseErrors(err.errors) })
            });
        }
        else {
            res.status(500).json({error:{global:"could not generate shiprocket token"}});
        }
    }
    else {
        const newOrder = new offlineorderModel({
            _id:mongoose.Types.ObjectId(),
            customerShipping_details: orderData.customerShipping_details,
            product_info: orderData.product_info,
            total_quantity: orderData.total_quantity,
            total_price: orderData.total_price,
            customer_email: orderData.customer_email,
            courier_id: orderData.courier_id,
            shipment_status: "processing",
            shiprocket_awb: "",
            cgst_amount: orderData.cgst_amount,
            sgst_amount: orderData.sgst_amount,
            igst_amount: orderData.igst_amount,
        })
        newOrder.save().then(async saveddata => {
            

            deleteQuant(orderData.product_info,orderData.admin_id,orderData.customer_email)


            let title = "printribe mail"
            let hello = "hello fellow dropshipper"
            let message = "thank you for ordering with us, your order will be shipped to you soon."
            let second_message = "for any further assistance please reach out to us."
            let link = "https://printribe-partner.web.app/#/login";
            SendMail(title,hello,message,second_message,orderData.customer_email,link);

            res.status(201).jsonp({ savedData: saveddata });

        })
        .catch((err) => {
            console.log("errors are:"+err)
            res.status(400).json({ errors: ParseErrors(err.errors) })
        });


    }
}

export default { add_order }