import axios from "axios";
import mongoose from "mongoose";
import wixToken from "../models/customerWix_token";

export default async function(auth_code, customer_id) {
    let token = "";

    let tokenMain = "";
    tokenMain = await wixToken.findOne({ 'customer_id': customer_id })
    .exec()
    .then(async (data) => {
        if(data) {
            var data = {
                "grant_type": "refresh_token",
                "client_id": process.env.WIX_APPID,
                "client_secret": process.env.WIX_SECRET,
                "refresh_token": data.refresh_token
            };

              const headers = {
                'Content-Type': 'application/json'
              }
       
              var config = {
                method: 'post',
                url: 'https://www.wix.com/oauth/access',
                headers: headers,
                data : data
              };

              token = await axios(config)
              .then(async function(response) {
                  let tokenSucc = "";
                  let exp_date = new Date();
                  console.log("refresh token is"+response.data.refresh_token)
                  exp_date = addDays(exp_date, 2);
                  tokenSucc = await wixToken.updateOne({ 'customer_id': customer_id }, { $set: { 'token': response.data.access_token, 'refresh_token': response.data.refresh_token, 'expiry_date': exp_date.toString() } })
                  .then((updateSucc) => {
                      console.log("updated successfully")
                      return response.data.access_token
                  })
                  .catch((err) => {
                      console.log("error occured while updating"+err)
                  })
                  return tokenSucc
              })
              .catch(function (error) {
                  console.log("something went wrong"+error)
              })
              return token;
        }
        else {
            var data = {
                "grant_type": "authorization_code",
                "client_id": process.env.WIX_APPID,
                "client_secret": process.env.WIX_SECRET,
                "code": auth_code
            };

              const headers = {
                'Content-Type': 'application/json'
              }
       
              var config = {
                method: 'post',
                url: 'https://www.wix.com/oauth/access',
                headers: headers,
                data : data
              };

              let exp_date = new Date();
              exp_date = addDays(exp_date, 2);

              token = await axios(config)
              .then(async function(response) {
                  let tokenSucc = "";
                  const tokenSave = new wixToken({
                    _id: mongoose.Types.ObjectId(),
                    token: response.data.access_token,
                    refresh_token: response.data.refresh_token,
                    expiry_date: exp_date.toString(),
                    customer_id: customer_id
                  })
                  tokenSucc = await tokenSave.save().then((savedData) => {
                      return response.data.access_token
                  })
                  .catch((err) => {
                      console.log("error occured"+err)
                  })
                  return tokenSucc
              })
              .catch(function (error) {
                  console.log("something went wrong"+error)
              })
              return token;
        }
    })
    .catch((err) => {
        console.log("fetching data error"+err)
    })

    return tokenMain;
}


function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }