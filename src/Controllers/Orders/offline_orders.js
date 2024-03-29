import axios from "axios";
import fs from "fs";
import JSZip from 'jszip';
import mongoose from "mongoose";
import offlineorderModel from "../../models/offline_invoice_orders";
import printribeSettingsModel from "../../models/printribe_settings";
import createPDF from "../../utils/createPDF";
import deleteQuant from "../../utils/deleteProductQuantity";
import getShipToken from "../../utils/GetShiprocketToken";
import ParseErrors from "../../utils/ParseErrors";
import SendMail from "../../utils/SendMail";
import sendInvoice from "../../utils/sendInvoice";
var zip = new JSZip();

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
                shipping_charges: orderData.shipping_charges,
                gst_details: orderData.gst_details,
                design_gst: orderData.design_gst,
                handling_gst: orderData.handling_gst,
                total_weight: orderData.total_weight,
                dimensions: orderData.dimensions,
                shiprocket_order: true
            })
            newOrder.save().then(async saveddata => {
                
    
                deleteQuant(orderData.product_info,orderData.admin_id,orderData.customer_email)

                let cust_name = saveddata.customerShipping_details[0].fullname;
                let address = saveddata.customerShipping_details[0].address1;
                let zipcode = saveddata.customerShipping_details[0].zip_code;
                let city = saveddata.customerShipping_details[0].city;
                let shipping_charges = 0.00;
                if(orderData.shipping_charges != "" || orderData.shipping_charges == undefined)
                {
                    shipping_charges = parseFloat(saveddata.shipping_charges).toFixed(2);
                }
                let state = saveddata.customerShipping_details[0].state;
                let state_code = orderData.state_code;
                let email = saveddata.customer_email;
                let phone = saveddata.customerShipping_details[0].phone;
                let invoice_no = await printribeSettingsModel.findOne({ 'company_name': 'printribe' })
                .exec()
                .then((settingsData) => {
                    return settingsData.invoice_no;
                })
                .catch((err) => {
                    console.log("could not get the invoice no");
                })
                let random = "";
                random = await createPDF(cust_name,address,zipcode,shipping_charges,state,state_code,email,phone,invoice_no,city,orderData.product_info,orderData.gst_details,orderData.total_price,orderData.design_gst,orderData.handling_gst);

 
                let name = orderData.customer_email.split('@')[0];
                let title = "printribe mail"
                let hello = "hello fellow dropshipper"
                let message = "thank you for ordering with us, your order will be shipped to you soon.Please click the link below to download your invoice"
                let second_message = "for any further assistance please reach out to us."
                let link = process.env.PROJ_DEV_HOST+"/uploads/"+random+".pdf";
//                SendMail(title,hello,message,second_message,orderData.customer_email,link);
                sendInvoice(name,orderData.customer_email,link);
    
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
                    await offlineorderModel.updateOne({'_id': saveddata._id}, { $set: {'shipment_ref_id': response.data.shipment_id, 'shipment_ord_id': response.data.order_id, 'pdf_link': link} })
                    .then((updateData) => {
                        let newinvoice_no = parseInt(invoice_no) + 1
                        printribeSettingsModel.updateOne({ 'company_name': 'printribe' }, { $set: { 'invoice_no': newinvoice_no.toString() }} )
                        .then((data) => {
                            console.log("updated invoice successfully")
                        })
                        .catch((err) => {
                            console.log("error while updating")
                        })
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
            shipment_status: "",
            shiprocket_awb: "",
            gst_details: orderData.gst_details,
            design_gst: orderData.design_gst,
            handling_gst: orderData.handling_gst,
            total_weight: orderData.total_weight,
            dimensions: orderData.dimensions
        })
        newOrder.save().then(async saveddata => {
            

            deleteQuant(orderData.product_info,orderData.admin_id,orderData.customer_email)

            let cust_name = saveddata.customerShipping_details[0].fullname;
            let address = saveddata.customerShipping_details[0].address1;
            let zipcode = saveddata.customerShipping_details[0].zip_code;
            let city = saveddata.customerShipping_details[0].city;
            let shipping_charges = 0.00;
            if(orderData.shipping_charges != "" || orderData.shipping_charges == undefined)
            {
                shipping_charges = parseFloat(saveddata.shipping_charges).toFixed(2);
            }
            let state = saveddata.customerShipping_details[0].state;
            let state_code = orderData.state_code;
            let email = saveddata.customer_email;
            let phone = saveddata.customerShipping_details[0].phone;
            let invoice_no = await printribeSettingsModel.findOne({ 'company_name': 'printribe' })
            .exec()
            .then((settingsData) => {
                return settingsData.invoice_no;
            })
            .catch((err) => {
                console.log("could not get the invoice no");
            })
            let random = "";
            random = await createPDF(cust_name,address,zipcode,shipping_charges,state,state_code,email,phone,invoice_no,city,orderData.product_info,orderData.gst_details,orderData.total_price,orderData.design_gst,orderData.handling_gst);


            let name = orderData.customer_email.split('@')[0];
            let title = "printribe mail"
            let hello = "hello fellow dropshipper"
            let message = "thank you for ordering with us, your order will be shipped to you soon.Please click the link below to download your invoice"
            let second_message = "for any further assistance please reach out to us."
            let link = process.env.PROJ_DEV_HOST+"/uploads/"+random+".pdf";
//            SendMail(title,hello,message,second_message,orderData.customer_email,link);
            sendInvoice(name,orderData.customer_email,link)

            offlineorderModel.updateOne({ '_id': saveddata._id}, { $set: { 'pdf_link': link } })
            .then((data) => {
                console.log("updated successfully")
            })
            .catch((err) => {
                console.log("error occured while updating")
            })

            let newinvoice_no = parseInt(invoice_no) + 1
            printribeSettingsModel.updateOne({ 'company_name': 'printribe' }, { $set: { 'invoice_no': newinvoice_no.toString() }} )
            .then((data) => {
                console.log("updated invoice successfully")
            })
            .catch((err) => {
                console.log("error while updating invoice no")
            })

            res.status(201).jsonp({ savedData: saveddata });

        })
        .catch((err) => {
            console.log("errors are:"+err)
            res.status(400).json({ errors: ParseErrors(err.errors) })
        });


    }
}

export const getPdfInvoice = (req,res) => {
    const id = req.params.id;

    offlineorderModel.findOne({ '_id': id })
    .exec()
    .then((data) => {
        res.status(200).json({ link: data.pdf_link })
    })
    .catch((err) => {
        res.status(400).json({ global: { error: "error occured while fetching data" } })
    })
}

export const downloadAllPDF = (req,res) => {
    let month = req.params.month;
    let year = req.params.year;
    offlineorderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
    { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} }]}).exec()
    .then(async (data) => {
          await Promise.all(data.map(async (val, key) => {
            let url = val.pdf_link.replace(process.env.PROJ_DEV_HOST, '.');
            console.log("new url link is :", url)
            var contentPromise = new JSZip.external.Promise(function (resolve, reject) {
                fs.readFile(url, function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
              });
            //   let nameZip = val.customerShipping_details[0].fullname + Date.now().toString();
              zip.file(url.replace('./uploads/', ''), contentPromise);
          }))


          let dateString = Date.now().toString();

          try {
            zip
            .generateNodeStream({type:'nodebuffer',streamFiles:true})
            .pipe(fs.createWriteStream('./uploads/'+dateString+'.zip'))
            .on('finish', async function () {
                // JSZip generates a readable stream with a "end" event,
                // but is piped here in a writable stream which emits a "finish" event.
                console.log("zip file written.");
  
                res.status(200).json({ zip_link: process.env.PROJ_DEV_HOST+'/uploads/'+dateString+'.zip' })
  
  
      
                //  let dataFile = qs.stringify({
                //   'data': process.env.PROJ_DEV_HOST+'ZakekeFiles/csv-data.zip'
                // });
                //  const headersZip = {
                //   'Accept': 'application/json',
                //   'Content-Type': 'multipart/form-data',
                //   'Authorization': 'Bearer ' + bearerObject.access_token
                // }
                //  const zipUploaded = await axios({
                //   url: 'https://api.zakeke.com/v2/csv/import', 
                //   method: "POST",
                //   data: dataFile,
                //   headers: headersZip
                //  })
                //  .catch((err) => {
                //    console.log("error while zip post request :"+err)
                //  })
      
      
                //  console.log("response :"+zipUploaded.LastError)
            });
          }
          catch (err) {
            res.status(400).json({global: { error: err }})
          }
    })
    .catch((err) => {
        console.log("error occured while fetching"+err)
        res.status(400).json({ global: { error: "could not fetch data" } })
    })
}

export const get_orders = (req,res) => {
    let month = req.params.month;
    let year = req.params.year;
    offlineorderModel.find({ "$and": [{ "$expr": { "$eq": [{ "$month": "$createdAt" }, parseInt(month, 10)]  } }, 
    { "$expr": {"$eq": [{"$year": "$createdAt"}, parseInt(year, 10)]} }]}).exec()
    .then((data) => {
        res.status(200).json({ resultData: data })
    })
    .catch((err) => {
        console.log("error occured while fetching"+err)
        res.status(400).json({ global: { error: "could not fetch data" } })
    })
}

export default { add_order, downloadAllPDF, get_orders, getPdfInvoice }