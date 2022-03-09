import axios from "axios";
import fs from "fs";
import jwt from "jsonwebtoken";
import util from "util";
import CustomerModel from "../../models/customers";
import customerProductsModel from "../../models/customer_inventory_products";
import getToken from "../../utils/getWixToken";


export const testToken = async (req,res) => {
    const { tokenData } = req.body;

    let token = "";
    token = await getToken(tokenData.auth_code,tokenData.customer_id);

    console.log("token is"+token)
    if(token != "")
    {
        var data = {
            "eventName": "APP_FINISHED_CONFIGURATION"
        };

          const headers = {
            'Authorization': token
          }
   
          var config = {
            method: 'post',
            url: 'https://www.wixapis.com/apps/v1/bi-event',
            headers: headers,
            data : data
          };

          token = await axios(config)
          .then(async function (response) {
              CustomerModel.updateOne({ '_id': tokenData.customer_id }, { $set: { 'customer_wix': 'active' } })
              .then((updateData) => {
                console.log("success response is"+response.data)
                res.status(200).json({ global: { success: "finished setup" } })
              })
              .catch((err) => {
                console.log("error occured while updating customer"+err)
                res.status(400).json({ global: {error: "error occured while updating customer"} })                  
              })
          })
          .catch((err) => {
              console.log("error occured while finishing set up"+err)
              res.status(400).json({ global: {error: "error occured while finishing set up"} })
          })
    }
    else {
        res.status(400).json({ error: "error" })
    }
}

export const tokenWebhook = (req,res) => {
    const { data } = req.body;

    let decodedData = jwt.decode(data)
    console.log("decoded data is"+decodedData);

    res.status(200).json({ global: { success: "response" } })
}

export const addProduct = async (req,res) => {
    const { productData } = req.body;

    let token = "";
    token = await getToken("",productData.customer_id);

    console.log("token is"+token)
    if(token != "") {

        await customerProductsModel.findOne({ 'product_id': productData.product_id, 'customer_id': productData.customer_id })
        .exec()
        .then(async (data) => {
            if(data) {
                let sendProdData = {
                    "product": {
                      "name": data.title,
                      "productType": "physical",
                      "priceData": {
                        "price":  parseInt(data.price, 10)
                      },
                      "productOptions": [
                          {
                              "name": "color",
                              "choices": [
                                  {
                                      "value": data.productcolor,
                                      "description": data.productcolor
                                  }
                              ]
                          },
                          {
                              "name": "size",
                              "choices": [
                                {
                                    "value": data.productsize,
                                    "description": data.productsize
                                }
                            ]                          
                          }
                      ],
                      "description": data.description,
                      "sku": data.title+data.productcolor+data.productsize,
                      "visible": true,
                      "ribbon": "Sale",
                      "brand": "Printribe",
                      "weight": 0.3,
                      "manageVariants": true
                    }
                  }
        
                  const headers = {
                    'Content-Type': 'application/json',  
                    'Authorization': token
                  }
           
                  var config = {
                    method: 'post',
                    url: 'https://www.wixapis.com/stores/v1/products',
                    headers: headers,
                    data : sendProdData
                  };
        
                  await axios(config)
                  .then(async function (response) {
                      customerProductsModel.updateOne({ '_id': data._id }, { $set: { 'wix_product_id': response.data.product.id, 'wix_inventory_id': response.data.product.inventoryItemId, 'wix_variant_id': response.data.product.variants[0].id } })
                      .then((updatedData) => {
                          console.log("data updated");
                          res.status(200).json({ wixData: response.data })
                      })
                      .catch((err) => {
                          console.log("error while updating wix response id"+err)
                          res.status(400).json({ global: { error: "could not update the wix response id" } })    
                      })
                  })
                  .catch((err) => {
                      console.log("error occured while adding"+err)
                      res.status(400).json({ global: { error: "could not add the product to wix" } })
                  })
            }
            else {
                console.log("could not find the product in customer incventory")
                res.status(400).json({ global: { error: "could not find the product in customer incventory" } })
            }
        })
        .catch((err) => {
            console.log("could not fetch the product")
            res.status(400).json({ global: { error: "could not fetch the product" } })
        })
    }
    else {
        res.status(400).json({ global: { error: "could not get token" } })
    }
    
}

export const uploadMedia = async (req,res) => {
    const { productData } = req.body;

    let token = "";
    token = await getToken("",productData.customer_id);

    console.log("token is"+token)
    if(token != "") {
        customerProductsModel.findOne({ 'product_id': productData.product_id, 'customer_id': productData.customer_id })
        .exec()
        .then(async (prodData) => {
            if(prodData) {

                console.log("wix product id is"+prodData.wix_product_id)
                console.log("product image is"+prodData.product_img)
                let dataMedia = {
                    "media": [
                      {
                        "url": prodData.product_img
                      }                      
                    ]
                  }

                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': token
                  }
           
                  var config = {
                    method: 'POST',
                    url: 'https://www.wixapis.com/stores/v1/products/'+prodData.wix_product_id+'/media',
                    headers: headers,
                    data: dataMedia
                  };
        
                  await axios(config)
                  .then( async function (resp) {
                      res.status(200).json({ global: { success: "uploaded media successfully" } })
                  })
                  .catch((err) => {
                      console.log("error occured while getting wix product"+err)
                      res.status(400).json({ global: { error: "error occured while getting product from wix" } });                  
                  })
            }
            else {
                res.status(400).json({ global: { error: "could not find the product" } });
            }
        })
        .catch((err) => {
            console.log("error occured while fetching data"+err)
            res.status(400).json({ global: { error: "error occured while fetching data" } });
        })
    }
    else {
        res.status(400).json({ global: { error: "could not generate token" } });
    }

}

export const addQuantity = async (req,res) => {
    const { productData } = req.body;

    let token = "";
    token = await getToken("",productData.customer_id);

    console.log("token is"+token)
    if(token != "") {
        await customerProductsModel.findOne({ 'product_id': productData.product_id, 'wix_product_id': productData.wix_product_id })
        .exec()
        .then(async (prodData) => {
            if(prodData) {

                

                const headersChange = {
                    'Content-Type': 'application/json',
                    'Authorization': token
                  }

                  let dataQuantChange = {
                    "inventoryItem": {
                        "id": prodData.wix_inventory_id,
                        "trackQuantity": true,
                        "variants": [
                            {
                                "variantId": prodData.wix_variant_id,
                                "quantity": prodData.quantity
                            }
                        ]
                    }
                }
                  var configChange = {
                    method: 'patch',
                    url: "https://www.wixapis.com/stores/v2/inventoryItems/"+prodData.wix_inventory_id,
                    headers: headersChange,
                    data: dataQuantChange
                  };
        
                  await axios(configChange)
                  .then(async function(responseData) {
                    res.status(200).json({ global: { success: "updated successfully" } })
                })
                .catch((err) => {
                    console.log("error occured while getting product wix info"+err)
                    res.status(400).json({ global: { error: "could not find wix data" } });                      
                })

                // const headers = {
                //     'Content-Type': 'application/json',
                //     'Authorization': token
                //   }

                //   let dataQuant = {
                //     "incrementData": [
                //       {
                //         "productId": prodData.wix_product_id,
                //         "variantId": "4e9cbd72-60aa-42c0-bbc1-c05e67c457f7",
                //         "incrementBy": 5
                //       }
                //     ]
                //   }
                //   var config = {
                //     method: 'post',
                //     url: "https://www.wixapis.com/stores/v2/inventoryItems/increment",
                //     headers: headers,
                //     data: dataQuant
                //   };
        
                //   await axios(config)
                //   .then(async function(responseData) {
                //       res.status(200).json({ global: { success: "updated successfully" } })
                //   })
                //   .catch((err) => {
                //       console.log("error occured while getting product wix info"+err)
                //       res.status(400).json({ global: { error: "could not find wix data" } });                      
                //   })
            }
            else {
                res.status(400).json({ global: { error: "could not find the product" } });
            }
        })
        .catch((err) => {
            console.log("error occured while fetching data"+err)
            res.status(400).json({ global: { error: "error occured while fetching data" } });
        })
    }
    else {
        res.status(400).json({ global: { error: "could not generate token" } });
    }

}

export const removeProd = async (req,res) => {
    const { productData } = req.body;

    let token = "";
    token = await getToken("",productData.customer_id);

    console.log("token is"+token)
    if(token != "") {
        customerProductsModel.findOne({ 'product_id': productData.product_id, 'customer_id': productData.customer_id })
        .exec()
        .then(async (data) => {
            if(data) {
                const headersChange = {
                    'Content-Type': 'application/json',
                    'Authorization': token
                  }
    
                  var configChange = {
                    method: 'delete',
                    url: "https://www.wixapis.com/stores/v1/products/"+data.wix_product_id,
                    headers: headersChange
                  };
        
                  await axios(configChange)
                  .then(async function(responseData) {
                    customerProductsModel.updateOne({ 'product_id': productData.product_id, 'customer_id': productData.customer_id }, { $set: { 'wix_product_id': '' } })
                    .then((updateData) => {
                        res.status(200).json({ global: { success: "deleted successfully" } })
                    })
                    .catch((err) => {
                        console.log("error occured while updating product data"+err)
                        res.status(400).json({ global: { error: "could not update customer product data" } });                                              
                    })
                })
                .catch((err) => {
                    console.log("error occured while getting product wix info"+err)
                    res.status(400).json({ global: { error: "could not find wix data" } });                      
                })
            }
            else {
                res.status(400).json({ global: { error: "could not find customer data" } });                                 
            }
        })
        .catch((err) => {
            console.log("error occured while fetching cutomer product data"+err)
            res.status(400).json({ global: { error: "error occured while fetching cutomer product data" } });                      
        })
    }
    else {
        res.status(400).json({ global: { error: "could not generate token" } });
    }
}

export const getOrders = async (req,res) => {
    const { productData } = req.body;

    let token = "";
    token = await getToken("",productData.customer_id);

    console.log("token is"+token)
    if(token != "") {
        const headersChange = {
            'Content-Type': 'application/json',
            'Authorization': token
          }

          let Senddata = {
          }
    
          var configChange = {
            method: 'post',
            url: "https://www.wixapis.com/stores/v2/orders/query",
            headers: headersChange,
            data: Senddata
          };
    
          await axios(configChange)
          .then(async function(responseData) {
            res.status(200).json({ orders: responseData.data })
        })
        .catch((err) => {
            console.log("error occured while getting orders from wix"+err)
            res.status(400).json({ global: { error: "could not find wix orders" } });                      
        })
    }
}


export const ordersPaid = async (req,res) => {
    const data = req.body;

    console.log("list of headers "
    +JSON.stringify(req.headers));

    var decoded = jwt.verify(data, fs.readFileSync('./ZakekeFiles/public.pem'), { algorithms: ['RS256'] });

    console.log("decoded data is "+ decoded);

    console.log("decoded data util inspect "+util.inspect(decoded,true));

    let ordersData = decoded.data;

    ordersData = JSON.parse(ordersData);

    console.log("orders Data is parsed :"+util.inspect(ordersData, true));

    let parsedOrderData = JSON.parse(ordersData.data);

    console.log("parsed orders Data is now :"+util.inspect(parsedOrderData, true));

    let itemExist = false;

    let itemArray = [];

    let shippingDetails = {
        "wix_customer_id": parsedOrderData.order.buyerInfo.id,
        "fullname": parsedOrderData.order.shippingInfo.shipmentDetails.address.fullName.firstName + parsedOrderData.order.shippingInfo.shipmentDetails.address.fullName.lastName,
        "address1": parsedOrderData.order.shippingInfo.shipmentDetails.address.addressLine1,
        "country":  "India",
        "zip_code": parsedOrderData.order.shippingInfo.shipmentDetails.address.zipCode,
        "state": parsedOrderData.order.shippingInfo.shipmentDetails.address.subdivision,
        "phone": parsedOrderData.order.shippingInfo.shipmentDetails.address.phone,
        "city": parsedOrderData.order.shippingInfo.shipmentDetails.address.city
    }

    console.log("wix order shipping details :" +shippingDetails);

    let orderDet = {
        "total_price": parsedOrderData.order.totals.total,
        "total_weight": parsedOrderData.order.totals.weight,
        "total_quantity": parsedOrderData.order.totals.quantity,
        "total_tax": parsedOrderData.order.totals.tax,
        "customer_email": parsedOrderData.order.buyerInfo.email
    }

    console.log("wix orders order details :"+orderDet);

    await Promise.all(parsedOrderData.order.lineItems.map(async (item,key) => {
        await customerProductsModel.findOne({ 'wix_product_id': item.productId }).exec()
        .then((proddata) => {
            if(proddata) {
                itemExist = true;
                parsedOrderData.order.lineItems[key]["description"] = proddata.description;
                parsedOrderData.order.lineItems[key]["product_img"] = proddata.product_img;
                parsedOrderData.order.lineItems[key]["category_id"] = proddata.category_id;
                itemArray.push(parsedOrderData.order.lineItems[key]);
            }
        })
        .catch((err) => {
            console.log('error occured while fetching product')
        })
    }))

    console.log("wix orders items array after getting the product :"+itemArray);

    let insertProductArr = [];

    await Promise.all(itemArray.map(async (items,keys) => {
        let newItemObj = {
            wix_product_id: items.productId,
            title: items.name,
            description: items.description,
            price: items.priceData.totalPrice,
            productsize: items.options[1].selection,
            productcolor: items.options[0].selection,
            product_img: items.product_img,
            category_id: items.category_id,
            quantity: items.quantity
        }

        insertProductArr.push(newItemObj)
    }))

    console.log("wix orders insert items array :"+insertProductArr);

    if(itemExist) {
         
    }

    res.status(200).json({ global: { success: "triggered data" }})
}
export default { testToken, tokenWebhook, addProduct, uploadMedia, addQuantity, removeProd, getOrders, ordersPaid }