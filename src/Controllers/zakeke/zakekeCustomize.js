import axios from "axios";
import mongoose from "mongoose";
import qs from "qs";
import designId from "../../models/customDesign_id";
import Products from "../../models/products";


export const getUpdatedPrice = (req,res)=>{
    let reqBody = req.body

    console.log("product id is: "+reqBody.productid)

    Products.find({'_id': reqBody.productid})
    .exec()
    .then((productsData)=>{
        const response = {
            products: productsData.map((productsres)=>({
                id:productsres._id,
                title: productsres.title,
                description: productsres.description,
                price: productsres.price,
                productsizes: productsres.productsizes,
                productcolors: productsres.productcolors,
                cover_img: productsres.cover_img,
                category_id: productsres.category_id,
                img: productsres.img,
                quantity: productsres.quantity
                }))
        }
        let finalPrice = (parseInt(response.products[0].price, 10) + reqBody.zakekeprice) * parseInt(reqBody.quantity, 10);

        if (reqBody.zakekepercentageprice > 0)
        {
            finalPrice += (parseInt(response.products[0].price, 10) *
 reqBody.zakekepercentageprice * parseInt(reqBody.quantity, 10)) / 100;
        }
        let isoutofstock = false;
        if(response.products[0].quantity < parseInt(reqBody.quantity, 10))
        {
            isoutofstock = true;
        }
        res.status(200).json({finalprice: finalPrice, isoutofstock: isoutofstock});
    })
    .catch(()=>{
        res.status(500).json({error:{global:"something went wrong"}});
    }); 


}

export const get_token = async (req,res) => {
    const id = req.params.id;
    let returndata = {}
    let sendData = qs.stringify({
        'grant_type':'client_credentials',
        'access_type':'S2S',
        'visitorcode':id
      });
      const token = `${process.env.ZAKEKE_CLIENT_ID}:${process.env.ZAKEKE_SECRET}`;
      const encodedToken = Buffer.from(token).toString('base64');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + encodedToken
      }
      await axios({
        url: 'https://api.zakeke.com/token',
        method: "POST",
        data: sendData,
        headers: headers
       })
       .then((data) => {
         returndata= data.data
       })
       .catch((err) => {
        res.status(400).json({error:{global:"error while generating token"}});
       })

       res.status(200).json({returndata})
}

export const getCartURL = async (req,res) => {
    const data = req.body
    if(data.designid)
    {
        let returndata = {}
        console.log("design id is:"+data.designid)
        let sendData = qs.stringify({
            'grant_type':'client_credentials',
            'access_type':'S2S',
            'visitorcode':data.additionaldata.customerUniqueId
          });
          const token = `${process.env.ZAKEKE_CLIENT_ID}:${process.env.ZAKEKE_SECRET}`;
          const encodedToken = Buffer.from(token).toString('base64');
          const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + encodedToken
          }
          let designData = {}
          await axios({
            url: 'https://api.zakeke.com/token',
            method: "POST",
            data: sendData,
            headers: headers
           })
           .then((data) => {
             returndata= data.data
           })
           .catch((err) => {
            res.status(400).json({error:{global:"error while generating token"}});
           })
           console.log("visitor id is:"+data.additionaldata.visitorId)
          const designSave = new designId({
            _id: mongoose.Types.ObjectId(),
              variantProductId: data.productid,
              customerUniqueId: data.additionaldata.customerUniqueId,
              designId: data.designid,
              visitorId: data.additionaldata.visitorId
          });
          designSave.save().then(async (saveddata) => {
                const Cartheaders = {
                  'Accept': 'application/json',
                  'Authorization': 'Bearer ' + returndata.access_token
                }
                let responseCart = {}
                await axios({
                  url: "https://api.zakeke.com/v1/designs/"+saveddata.designId,
                  method: "GET",
                  headers: Cartheaders
                 })
                 .then((data) => {
                   responseCart = data.data
                 })
                 .catch((err) => {
                   console.log("error occured :"+err)
                  res.status(400).json({error:{global:"error while getting cart url"}});
                 })
  
                 if(res.headersSent) { 
                }
                else {
                  if(responseCart)
                  {
                    designId.updateOne({"_id": saveddata._id}, {$set: {"modelCode": responseCart.modelCode, "tempPreviewImageUrl": responseCart.tempPreviewImageUrl, "totalPrice": responseCart.designUnitPrice}})
                    .then((data) => {
                      res.status(200).json({returnurl: process.env.ZAKEKE_CART_URL})
                    })
                    .catch((err) => res.status(400).json({error:{global:"error while updating data :"+err}}))
                  }
                }
          })
    }
    else
    {
        res.status(400).json({error:{global:"design id was not provided"}});
    }
}

export const get_cartInfo = (req,res) => {
  const id = req.params.id;

  designId.find({'visitorId': id})
  .exec()
  .then((data) => {
    const response = {
      totalProducts: data.length,
      products_info : data.map((value) => ({
        id: value._id,
        ProductId: value.variantProductId,
        customerUniqueId: value.customerUniqueId,
        designId: value.designId,
        visitorId: value.visitorId,
        modelCode: value.modelCode,
        tempPreviewImageUrl: value.tempPreviewImageUrl,
        totalPrice: value.totalPrice
      }))
    }
    res.status(200).json({designInfo:response});
  })
  .catch(()=>{
    res.status(500).json({error:{global:"something went wrong while fetching data"}})
   }); 
}

export const edit_cart = async (req,res) => {
    const data = req.body

    if(data.designid)
    {
        let returndata = {}
        console.log("design id is:"+data.designid)
        let sendData = qs.stringify({
            'grant_type':'client_credentials',
            'access_type':'S2S',
            'visitorcode':data.additionaldata.customerUniqueId
          });
          const token = `${process.env.ZAKEKE_CLIENT_ID}:${process.env.ZAKEKE_SECRET}`;
          const encodedToken = Buffer.from(token).toString('base64');
          const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + encodedToken
          }
          let designData = {}
          await axios({
            url: 'https://api.zakeke.com/token',
            method: "POST",
            data: sendData,
            headers: headers
           })
           .then((data) => {
             returndata= data.data
           })
           .catch((err) => {
            res.status(400).json({error:{global:"error while generating token"}});
           })
           console.log("visitor id is:"+data.additionaldata.visitorId)

          const Cartheaders = {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + returndata.access_token
          }
          let responseCart = {}
          await axios({
            url: "https://api.zakeke.com/v1/designs/"+data.designid,
            method: "GET",
            headers: Cartheaders
            })
            .then((data) => {
              responseCart = data.data
            })
            .catch((err) => {
              console.log("error occured :"+err)
            res.status(400).json({error:{global:"error while getting cart url"}});
            })

            if(res.headersSent) { 
          }
          else {
            if(responseCart)
            {
              designId.updateOne({"visitorId": data.additionaldata.visitorId, "designId": data.designid}, {$set: {"modelCode": responseCart.modelCode, "tempPreviewImageUrl": responseCart.tempPreviewImageUrl, "totalPrice": responseCart.designUnitPrice}})
              .then((data) => {
                res.status(200).json({returnurl: process.env.ZAKEKE_CART_URL})
              })
              .catch((err) => res.status(400).json({error:{global:"error while updating data :"+err}}))
            }
          }
    }
    else
    {
        res.status(400).json({error:{global:"design id was not provided"}});
    }
}

export default { getUpdatedPrice, get_cartInfo, get_token, edit_cart, getCartURL }