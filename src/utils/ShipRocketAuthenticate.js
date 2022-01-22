import axios from "axios";
import mongoose from "mongoose";
import tokenModel from "../models/tokens";

export default async function(status) {
    if(status == "new create") {

        var data = {
          email: process.env.SHIPROCKET_EMAIL,
          password: process.env.SHIPROCKET_PASS
        };
 
        var config = {
          method: 'post',
          url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
          headers: { },
          data : data
        };
         
        let tokenAxVal = await axios(config)
        .then(async function (response) {
          console.log(JSON.stringify(response.data));
          let exp_date = new Date(response.data.created_at);
          exp_date = addDays(exp_date, 8);
          let token_save = new tokenModel({
            _id: mongoose.Types.ObjectId(),
            token: response.data.token,
            expiry_date: exp_date.toString(),
            name: 'shiprocket'
        });
        let tokenVal = await token_save.save().then((savedResult) => {
            return savedResult.token;
        })
        .catch((err) => console.log("couldn't save token :"+err))
        return tokenVal
        })
        .catch(function (error) {
          console.log(error.response.data.errors);
        });
        return tokenAxVal;
    }
    else if(status == "new") {
      var data = {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASS
      };
 
        var config = {
          method: 'post',
          url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
          headers: { },
          data : data
        };
         
        let tokenAxVal = await axios(config)
        .then(async function (response) {
          console.log(JSON.stringify(response.data));
          let exp_date = new Date(response.data.created_at);
          exp_date = addDays(exp_date, 8);
          let tokenVal = await tokenModel.updateOne({ "name": 'shiprocket'}, {$set: { "token": response.data.token, "expiry_date": exp_date.toString() }} )
        .then((savedResult) => {
            return response.data.token;
        })
        .catch((err) => console.log("couldn't update token :"+err))
        return tokenVal;
        })
        .catch(function (error) {
          console.log(error);
        });   
        return tokenAxVal;
    }
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }