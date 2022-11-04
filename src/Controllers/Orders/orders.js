import axios from "axios";
import mongoose from "mongoose";
import categoriesModel from "../../models/categories";
import customerShippingModel from "../../models/customer_shipping";
import orderModel from "../../models/orders";
import paymentHistoryModel from "../../models/payment_history";
import printribeSettingsModel from "../../models/printribe_settings";
import addProductsInventory from "../../utils/addProductsToCustomer";
import createPDF from "../../utils/createPDF";
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
            retail_price: orderData.retail_price,
            shipping_type: orderData.shipping_type,
            shipping_charges: orderData.shipping_charges,
            payment_type: orderData.payment_type,
            payment_ref_id: orderData.payment_ref_id,
            customer_email: orderData.customer_email,
            visitor_id: orderData.visitor_id,
            customer_id: orderData.customer_id,
            courier_id: orderData.courier_id,
            design_price: orderData.design_price,
            gst_details: orderData.gst_details,
            shipment_status: "processing",
            return_status: "",
            returned_awb: "",
            shiprocket_awb: ""
        })
        newOrder.save().then(async saveddata => {
            
            const savedDataPopulate = await saveddata
            .populate('customerShipping_id')

            deleteQuant(orderData.product_info,orderData.customer_id,orderData.customer_email)

            let addCustomerInventory = addProductsInventory(savedDataPopulate.product_info, savedDataPopulate.customer_id)
            
            let random = "";
            let state_code = "29";
            let invoice_no = await printribeSettingsModel.findOne({ 'company_name': 'printribe' })
            .exec()
            .then((settingsData) => {
                return settingsData.invoice_no;
            })
            .catch((err) => {
                console.log("could not get the invoice no");
            })
            random = await createPDF(savedDataPopulate.customerShipping_id.fullname,savedDataPopulate.customerShipping_id.address1,savedDataPopulate.customerShipping_id.zip_code,orderData.shipping_charges,savedDataPopulate.customerShipping_id.state,state_code,orderData.customer_email,savedDataPopulate.customerShipping_id.phone,invoice_no,savedDataPopulate.customerShipping_id.city,orderData.product_info,orderData.gst_details,orderData.total_price);

            let title = "printribe mail"
            let hello = "hello fellow dropshipper"
            let message = "thank you for ordering with us, your order will be shipped to you soon.Please click the link below to download your invoice."
            let second_message = "for any further assistance please reach out to us."
            let link = process.env.PROJ_DEV_HOST+"/uploads/"+random+".pdf";
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

              if(orderData.shipping_type == "shiprocket") {
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
                  await orderModel.updateOne({'_id': savedDataPopulate._id}, { $set: {'shipment_ref_id': response.data.shipment_id, 'shipment_ord_id': response.data.order_id, 'pdf_link': link} })
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
              }
              else {
                await orderModel.updateOne({'_id': savedDataPopulate._id}, { $set: {'pdf_link': link} })
                .then((updateData) => {
                  res.status(201).jsonp({ savedData: savedDataPopulate });
                })
                .catch((err) => {
                  console.log("couldn't update the order database "+err)
                })
              } 



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

export const getSalesProducts = async(req,res) => {
  let month = req.params.month;
  let year = req.params.year;
  let quarterly = req.params.quarter;
  let semester = req.params.semester;
  let week = req.params.week;
  console.log("WEEK IS", week);
  console.log("month IS", month);
  console.log("quarter IS", quarterly);
  console.log("semester IS", semester);
  let orders;
  if(parseInt(quarterly, 10) !== 0) {
    if(quarterly == "1st") {
      let first_date = year.toString() + "-" + "01" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 3 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(quarterly == "2nd") {
      let first_date = year.toString() + "-" + "04" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 6 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(quarterly == "3rd") {
      let first_date = year.toString() + "-" + "07" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 9 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(quarterly == "4th") {
      let first_date = year.toString() + "-" + "10" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 12 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
  }
  else if(parseInt(semester, 10) !== 0) {
    if(semester == "1st") {
      let first_date = year.toString() + "-" + "01" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 6 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(semester == "2nd") {
      let first_date = year.toString() + "-" + "07" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 12 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
  }
  else if(parseInt(month, 10) !== 0) {
   if(parseInt(week, 10) !== 0) {
    if(week == "1st") {
      let first_date = year.toString() + "-" + month.toString() + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(last_date);
      orders = await orderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
      { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(week == "2nd") {
      let first_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "15"
      let dategenLast = new Date(last_date);
      orders = await orderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
      { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(week == "3rd") {
      let first_date = year.toString() + "-" + month.toString() + "-" + "15"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "22"
      let dategenLast = new Date(last_date);
      orders = await orderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
      { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(week == "4th") {
      let first_date = year.toString() + "-" + month.toString() + "-" + "22"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), parseInt(month) + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
      { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
   }
   else {
    orders = await orderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
    { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
    { "$expr": {"$eq": [ "$shipment_status", "processed" ]} }]})
    .exec()
    .then((data) => {
      return data;
    })
    .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
   }
  }
  if(orders) {
    let totAmt = 0;
    let productsArr = [];
    let totProd = 0;
    await Promise.all(orders.map(async (val, key) => {
      totAmt = totAmt + parseInt(val.total_price);
      await Promise.all(val.product_info.map((prodVal, prodKey) => {
        totProd = totProd + 1;
        productsArr.push(prodVal);
      }))
    }))
    res.status(200).json({data: { "total_amount": totAmt, "products": productsArr, "total_products": totProd }});
  }
  else {
    res.status(500).json({error:{global:"orders could not be found"}})
  }
}

export const getOrdersReport = async (req,res) => {
  let month = req.params.month;
  let year = req.params.year;
  let quarterly = req.params.quarter;
  let semester = req.params.semester;
  let week = req.params.week;
  console.log("WEEK IS", week);
  console.log("month IS", month);
  console.log("quarter IS", quarterly);
  console.log("semester IS", semester);
  let orders;
  if(parseInt(quarterly, 10) !== 0) {
    if(quarterly == "1st") {
      let first_date = year.toString() + "-" + "01" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 3 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(quarterly == "2nd") {
      let first_date = year.toString() + "-" + "04" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 6 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(quarterly == "3rd") {
      let first_date = year.toString() + "-" + "07" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 9 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(quarterly == "4th") {
      let first_date = year.toString() + "-" + "10" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 12 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
  }
  else if(parseInt(semester, 10) !== 0) {
    if(semester == "1st") {
      let first_date = year.toString() + "-" + "01" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 6 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(semester == "2nd") {
      let first_date = year.toString() + "-" + "07" + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), 12 + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
  }
  else if(parseInt(month, 10) !== 0) {
   if(parseInt(week, 10) !== 0) {
    if(week == "1st") {
      let first_date = year.toString() + "-" + month.toString() + "-" + "01"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(last_date);
      orders = await orderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
      { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(week == "2nd") {
      let first_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "15"
      let dategenLast = new Date(last_date);
      orders = await orderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
      { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(week == "3rd") {
      let first_date = year.toString() + "-" + month.toString() + "-" + "15"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "22"
      let dategenLast = new Date(last_date);
      orders = await orderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
      { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
    else if(week == "4th") {
      let first_date = year.toString() + "-" + month.toString() + "-" + "22"
      let dategenFirst = new Date(first_date);
      let last_date = year.toString() + "-" + month.toString() + "-" + "08"
      let dategenLast = new Date(parseInt(year, 10), parseInt(month) + 1, 0);
      orders = await orderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
      { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
      { "$expr": {"$eq": [ "$shipment_status", "processed" ]} },
      { "$expr": {"$gte": [ "$createdAt", dategenFirst ]} },
      { "$expr": {"$lte": [ "$createdAt", dategenLast ]} }]})
      .exec()
      .then((data) => {
        return data;
      })
      .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
    }
   }
   else {
    orders = await orderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
    { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} },
    { "$expr": {"$eq": [ "$shipment_status", "processed" ]} }]})
    .exec()
    .then((data) => {
      return data;
    })
    .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
   }
  }
  if(orders) {
    res.status(200).json({data: { "total_orders": orders.length, "orders": orders }});
  }
  else {
    res.status(500).json({error:{global:"orders could not be found"}})
  }
}

export const productsChartData = async (req,res) => {
  
  let orders = await orderModel.find({ 'shipment_status': 'processed'})
  .exec()
  .then((data) => {
    let newData = data.map((orderData) => ({
      _id: orderData._id,
      customerShipping_id: orderData.customerShipping_id,
      product_info: orderData.product_info.map((productData) => ({
        product_id: productData.product_id,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        productsize: productData.productsize,
        productcolor: productData.productcolor,
        product_img: productData.product_img,
        category_id: productData.category_id,
        quantity: productData.quantity,
        maincat: "",
        zakeke_price: productData.zakeke_price,
        designID: productData.designID
      })),
      total_quantity: orderData.total_quantity,
      total_price: orderData.total_price,
      design_price: orderData.design_price,
      shipping_charges: orderData.shipping_charges,
      payment_type: orderData.payment_type,
      payment_ref_id: orderData.payment_ref_id,
      shipment_status: orderData.shipment_status,
      customer_email: orderData.customer_email,
      customer_id: orderData.customer_id,
      courier_id: orderData.courier_id,
      visitor_id: orderData.visitor_id,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
      __v: orderData.__v,
      shipment_ord_id: orderData.shipment_ord_id,
      shipment_ref_id: orderData.shipment_ref_id,
      gst_details: orderData.gst_details
    }))
    return newData;
  })
  .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
  if(orders) {
    await Promise.all(orders.map(async(val, key) => {
      await Promise.all(val.product_info.map(async(valProd, valKey) => {
        let mainCatData = await categoriesModel.findOne({ '_id': valProd.category_id }).exec()
        .then((categorieData) => {
          return categorieData;
        })
        .catch((err) => res.status(500).json({error:{global:"categorie couldn't be found"}}))

        if(mainCatData.maincat !== "0") {
          orders[key]["product_info"][valKey].maincat = mainCatData.maincat;
        }
        else {
          orders[key]["product_info"][valKey].maincat = valProd.category_id;
        }
      }))
    }))

    res.status(201).json({ data: orders })
  }
}

export const productsSubChartData = async (req,res) => {
  let orders = await orderModel.find({ 'shipment_status': 'processed'})
  .exec()
  .then((data) => {
    let newData = data.map((orderData) => ({
      _id: orderData._id,
      customerShipping_id: orderData.customerShipping_id,
      product_info: orderData.product_info.map((productData) => ({
        product_id: productData.product_id,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        productsize: productData.productsize,
        productcolor: productData.productcolor,
        product_img: productData.product_img,
        category_id: productData.category_id,
        quantity: productData.quantity,
        subcat: "",
        zakeke_price: productData.zakeke_price,
        designID: productData.designID
      })),
      total_quantity: orderData.total_quantity,
      total_price: orderData.total_price,
      design_price: orderData.design_price,
      shipping_charges: orderData.shipping_charges,
      payment_type: orderData.payment_type,
      payment_ref_id: orderData.payment_ref_id,
      shipment_status: orderData.shipment_status,
      customer_email: orderData.customer_email,
      customer_id: orderData.customer_id,
      courier_id: orderData.courier_id,
      visitor_id: orderData.visitor_id,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
      __v: orderData.__v,
      shipment_ord_id: orderData.shipment_ord_id,
      shipment_ref_id: orderData.shipment_ref_id,
      gst_details: orderData.gst_details
    }))
    return newData;
  })
  .catch((err) => res.status(500).json({error:{global:"orders could not be found"}}))
  if(orders) {
    await Promise.all(orders.map(async(val, key) => {
      await Promise.all(val.product_info.map(async(valProd, valKey) => {
        let mainCatData = await categoriesModel.findOne({ '_id': valProd.category_id }).exec()
        .then((categorieData) => {
          return categorieData;
        })
        .catch((err) => res.status(500).json({error:{global:"categorie couldn't be found"}}))

        if(mainCatData.subcat !== "0") {
          orders[key]["product_info"][valKey].subcat = mainCatData.subcat;
        }
        else {
          orders[key]["product_info"][valKey].subcat = valProd.category_id;
        }
      }))
    }))

    res.status(201).json({ data: orders })
  }
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

export const generateCustomerReturn = (req,res) => {
  let { data } = req.body;
  orderModel.findOne({ '_id': data.id, 'shipment_status': "processed" })
  .exec()
  .then(async (orderdata) => {
    if(orderdata) {
      const savedDataPopulate = await customerShippingModel.findOne({'_id': orderdata.customerShipping_id})
      .exec()
      .then((shipdata) => {
        return shipdata;
      })
      .catch((err) => res.status(404).json({error:{global:"shpiment info could not be found"+err}}))
      const weightTotal = parseInt(orderdata.total_quantity) * 0.1; 
      const pincode = savedDataPopulate.zip_code;
      const weight = weightTotal;
  
  
      const token = await getShipToken();
      if(token != "") {
          const headers = {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            }
          var config = {
          method: 'get',
          url: 'https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode='+pincode+'&delivery_postcode='+process.env.SHIPROCKET_PICKUP_PIN+'&cod=0&weight='+weight+'&is_return='+1,
          headers: headers
          };
          
          axios(config)
          .then( async function (response) {
            if(response.status = 200) {
                const nDate = new Date().toISOString('en-US', {
                  timeZone: 'Asia/Calcutta'
                }).slice(0, 10);
    
                let shippingProductsArr = [];
    
                await Promise.all(orderdata.product_info.map((item, key) => {
                    let data = {
                        "name": item.title,
                        "sku": item.title+item.productsize+item.productcolor,
                        "units": parseInt(item.quantity, 10),
                        "selling_price": parseInt(item.price, 10),
                        }
    
                        shippingProductsArr.push(data);
                }))
    
                const weightTotal = parseInt(orderdata.total_quantity) * 0.1; 
                let orderNo = orderdata._id + "1";
    
                let shipRockData = {
                  "order_id": orderNo,
                  "order_date": nDate,
                  "channel_id": 147857,
                  "pickup_customer_name": savedDataPopulate.fullname,
                  "pickup_last_name": "",
                  "pickup_address": savedDataPopulate.address1,
                  "pickup_address_2": savedDataPopulate.address2,
                  "pickup_city": savedDataPopulate.city,
                  "pickup_state": savedDataPopulate.state,
                  "pickup_country": "India",
                  "pickup_pincode": savedDataPopulate.zip_code,
                  "pickup_email": orderdata.customer_email,
                  "pickup_phone": savedDataPopulate.phone,
                  "pickup_isd_code": "91",
                  "shipping_customer_name": "PRINTRIBE",
                  "shipping_last_name": "",
                  "shipping_address": "1, Mallayya Industrial Area, Opposite Maruti Solar System",
                  "shipping_address_2": "Kereguddadahalli, Chikkabanavara",
                  "shipping_city": "Bangalore Rural",
                  "shipping_country": "India",
                  "shipping_pincode": 560090,
                  "shipping_state": "Karnataka",
                  "shipping_email": "theprintribe@gmail.com",
                  "shipping_isd_code": "91",
                  "shipping_phone": 8951205960,
                  "order_items": shippingProductsArr,
                  "payment_method": "PREPAID",
                  "total_discount": "0",
                  "sub_total": parseInt(orderdata.total_price, 10),
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
              url: 'https://apiv2.shiprocket.in/v1/external/orders/create/return',
              data: shipRockData,
              headers: Shippingheaders
              };
              
              await axios(config)
              .then(async function (responseReturn) {
                await orderModel.updateOne({'_id': orderdata._id}, { $set: {'return_status': 'created'} })
                .then((updateData) => {
                  res.status(201).jsonp({ shiprocketData: responseReturn });
                })
                .catch((err) => {
                  console.log("couldn't update the order database "+err)
                })
              })
              .catch(function (error) {
              console.log("error occured while creating shipping order"+error);
              res.status(400).json({ errors: error })
              });
            }
          })
          .catch(function (error) {
          console.log("error occured while fetching info"+error);
          res.status(400).json({ errors: error })
          });
      }
      else {
          res.status(400).json({error:{global:"token could not be generated"}});
      }
    }
    else {
      res.status(400).json({error:{global:"no order found"}});
    }
  })
  .catch((err) => res.status(404).json({error:{global:"orders could not be fetched"+err}}))
}

export const getcustomerStatement = async (req,res) => {
  const customer_id = req.params.id

  let orders = await orderModel.find({'customer_id': customer_id})
  .exec()
  .then((orderData) => {
    return orderData
  })
  .catch((err) => res.status(400).json({error:{global:"error occured while fetching orders"}}))

  let walletHistory = await paymentHistoryModel.find({ 'customer_id': customer_id, $or: [{ payment_status: "debited" }, { payment_status: "success" }] })
  .exec()
  .then((walletHistory) => {
    return walletHistory
  })
  .catch((err) => res.status(400).json({error:{global:"error occured while fetching wallet history"}}))

  res.status(200).json({ statement: { "orders": orders, "walletHistory": walletHistory } })
}

export default { add_order, getCustomer_orders, productsSubChartData, productsChartData, getSalesProducts, getOrdersReport, getAdminOngoingOrders, getAdminOtherOrders, getCustomerOngoing, generateCustomerReturn, getcustomerStatement }