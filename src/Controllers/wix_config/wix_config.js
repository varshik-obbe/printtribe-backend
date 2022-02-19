import axios from "axios";
import jwt from "jsonwebtoken";
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
              console.log("success response is"+response.data)
              res.status(200).json({ global: { success: "finished setup" } })
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
                              "name": data.productcolor,
                              "choices": [
                                  {
                                      "value": data.productcolor,
                                      "description": data.productcolor
                                  }
                              ]
                          },
                          {
                              "name": data.productsize,
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
                      "manageVariants": false
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
                      console.log("product id is"+response.data.product.id)
                      customerProductsModel.updateOne({ '_id': data._id }, { $set: { 'wix_product_id': response.data.product.id } })
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

export default { testToken, tokenWebhook, addProduct }