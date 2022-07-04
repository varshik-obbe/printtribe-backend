import axios from "axios";
import mongoose from "mongoose";
import orderModel from "../../models/orders";
import addProductsInventory from "../../utils/addProductsToCustomer";
import deleteQuant from "../../utils/deleteProductQuantity";
import getShipToken from "../../utils/GetShiprocketToken";
import ParseErrors from "../../utils/ParseErrors";
import SendMail from "../../utils/SendMail";

export const add_order = async (req,res) => {
    const { orderData } = req.body;

    const token = await getShipToken();
    if(token != "") {
        const newOrder = new orderModel({
            _id:mongoose.Types.ObjectId(),
            customerShipping_id: orderData.customerShipping_id,
            product_info: orderData.product_info,
            total_quantity: orderData.total_quantity,
            total_price: orderData.total_price,
            shipping_charges: orderData.shipping_charges,
            payment_type: orderData.payment_type,
            payment_ref_id: orderData.payment_ref_id,
            customer_email: orderData.customer_email,
            visitor_id: orderData.visitor_id,
            customer_id: orderData.customer_id,
            courier_id: orderData.courier_id,
            gst_details: orderData.gst_details,
            shipment_status: "processing",
            shiprocket_awb: ""
        })
        newOrder.save().then(async saveddata => {
            
            const savedDataPopulate = await saveddata
            .populate('customerShipping_id')

            deleteQuant(orderData.product_info,orderData.customer_id,orderData.customer_email)

            let addCustomerInventory = addProductsInventory(savedDataPopulate.product_info, savedDataPopulate.customer_id)

            let title = "printribe mail"
            let hello = "hello fellow dropshipper"
            let message = "thank you for ordering with us, please find the order in partner panel link below."
            let second_message = "for any further assistance please reach out to us."
            let link = "https://printribe-partner.web.app/#/login";
            SendMail(title,hello,message,second_message,orderData.customer_email,link);

            if(addCustomerInventory) {
              let newDate = new Date();
            
              let productArrData = [];
  
              // await Promise.all(orderData.product_info.map((item, key) => {
              //     let data = {
              //         "orderDetailCode": item.product_id+item.productsize+item.productcolor+orderData.visitor_id,
              //         "designID": item.designID,
              //         "modelUnitPrice": parseInt(item.price, 10),
              //         "designUnitPrice": parseInt(item.zakeke_price, 10),
              //         "quantity": parseInt(item.quantity, 10)
              //         }
  
              //         productArrData.push(data);
              // }))
              //    let zakekeOrderJson = {
              //     "orderCode": savedDataPopulate._id,
              //     "orderDate": newDate.toISOString(),
              //     "sessionID": Date.now().toString(),
              //     "total": parseInt(orderData.total_price, 10),
              //     "details": productArrData
              //    }
  
              //    let returndata = {}
              //    let sendData = qs.stringify({
              //        'grant_type':'client_credentials',
              //        'access_type':'S2S',
              //        'visitorcode':orderData.visitor_id
              //      });
              //      const tokenZakeke = `${process.env.ZAKEKE_CLIENT_ID}:${process.env.ZAKEKE_SECRET}`;
              //      const encodedToken = Buffer.from(tokenZakeke).toString('base64');
              //      const headers = {
              //        'Accept': 'application/json',
              //        'Content-Type': 'application/x-www-form-urlencoded',
              //        'Authorization': 'Basic ' + encodedToken
              //      }
              //      await axios({
              //        url: 'https://api.zakeke.com/token',
              //        method: "POST",
              //        data: sendData,
              //        headers: headers
              //       })
              //       .then((data) => {
              //         returndata= data.data
              //       })
              //       .catch((err) => {
              //        res.status(400).json({error:{global:"error while generating token"}});
              //       })
  
              //       console.log("zakeke token is:"+returndata.access_token)
              //       const orderHeaderData = {
              //         'Accept': 'application/json',
              //         'Authorization': 'Bearer ' + returndata.access_token
              //       }

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
                "order_id": savedDataPopulate._id,
                "order_date": nDate,
                "pickup_location": process.env.SHIPROCKET_PICKUP_NAME,
                "billing_customer_name": savedDataPopulate.customerShipping_id.fullname,
                "billing_last_name": savedDataPopulate.customerShipping_id.fullname,
                "billing_address": savedDataPopulate.customerShipping_id.address1,
                "billing_address_2": savedDataPopulate.customerShipping_id.address2,
                "billing_city": savedDataPopulate.customerShipping_id.city,
                "billing_pincode": savedDataPopulate.customerShipping_id.zip_code,
                "billing_state": savedDataPopulate.customerShipping_id.state,
                "billing_country": "India",
                "billing_email": orderData.customer_email,
                "billing_phone": savedDataPopulate.customerShipping_id.phone,
                "shipping_is_billing": true,
                "order_items": shippingProductsArr,
                "payment_method": "Prepaid",
                "shipping_charges": parseInt(orderData.shipping_charges),
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
              await orderModel.updateOne({'_id': savedDataPopulate._id}, { $set: {'shipment_ref_id': response.data.shipment_id, 'shipment_ord_id': response.data.order_id} })
              .then((updateData) => {
                res.status(201).jsonp({ savedData: savedDataPopulate });
              })
              .catch((err) => {
                console.log("couldn't update the order database "+err)
              })
            })
            .catch(function (error) {
            console.log("error occured while creating shipping order"+error);
            res.status(400).json({ errors: error })
            });



                    // await axios({
                    //   url: 'https://api.zakeke.com/v1/order',
                    //   method: "POST",
                    //   data: zakekeOrderJson,
                    //   headers: orderHeaderData
                    //  })
                    //  .then(async (data) => {
                    //  })
                    //  .catch((err) => {
                    //    console.log("error occured :"+err)
                    //   res.status(400).json({error:{global:"error while sending order"}});
                    //  })
            }
            else {
              res.status(500).json({error:{global:"could not add products to customer"}});
            }
            
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

export const getCustomer_orders = (req,res) => {
  const customer_id = req.params.id
  
  orderModel.find({ 'customer_id': customer_id, $or: [{ shipment_status: "cancelled" }, { shipment_status: "processed" }] })
  .populate('customerShipping_id')
  .exec()
  .then((orderdata) => {
    if(orderdata) {
      res.status(201).json({ orders: orderdata })
    }
    else {
      res.status(500).json({error:{global:"orders could not be found"}});
    }
  })
  .catch((err) => res.status(500).json({error:{global:"orders could not be fetched"+err}}))
}

export const getCustomerOngoing = (req,res) => {
  const customer_id = req.params.id

  orderModel.find({ 'customer_id': customer_id, $or: [{ shipment_status: "processing" }, { shipment_status: "awb generated" }, { shipment_status: "picking up order" }] })
  .populate('customerShipping_id')
  .exec()
  .then((orderdata) => {
    if(orderdata) {
      res.status(201).json({ orders: orderdata })
    }
    else {
      res.status(500).json({error:{global:"orders could not be found"}});
    }
  })
  .catch((err) => res.status(500).json({error:{global:"orders could not be fetched"+err}}))
}

export const getAdminOngoingOrders = (req,res) => {
  orderModel.find({ $or: [{ shipment_status: "processing" }, { shipment_status: "awb generated" }, { shipment_status: "picking up order" }] })
  .exec()
  .then((orderdata) => {
    if(orderdata) {
      res.status(201).json({ orders: orderdata })
    }
    else {
      res.status(500).json({error:{global:"no ongoing orders"}});
    }
  })
}

export const getAdminOtherOrders = (req,res) => {
  orderModel.find({ $or: [{ shipment_status: "processed" }, { shipment_status: "cancelled" }] })
  .exec()
  .then((orderdata) => {
    if(orderdata) {
      res.status(201).json({ orders: orderdata })
    }
    else {
      res.status(500).json({error:{global:"no ongoing orders"}});
    }
  })
}

export default { add_order, getCustomer_orders, getAdminOngoingOrders, getAdminOtherOrders, getCustomerOngoing }