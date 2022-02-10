import axios from "axios";
import mongoose from "mongoose";
import shiprocketPickupModel from "../models/shiprocketPickup";
import getShipToken from "./GetShiprocketToken";

export default async function (orderdata) {
    const token = await getShipToken();
    if(token != "") {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }

        var data = {
            shipment_id: orderdata.shipment_ref_id
        };
        var config = {
        method: 'post',
        url: 'https://apiv2.shiprocket.in/v1/external/courier/generate/pickup',
        headers: headers,
        data : data
        };
        
        let status = await axios(config)
        .then(async function (response) {
            console.log("status from shiprocket"+response.status)
            if(response.data.pickup_status == 1) {
                const createPickup = new shiprocketPickupModel({
                    _id:mongoose.Types.ObjectId(),
                    shiprocket_awb: orderdata.shiprocket_awb,
                    description: response.data.response.data,
                    pickup_scheduled_date: response.data.response.pickup_scheduled_date,
                    pickup_token_number: response.data.response.pickup_token_number,
                    status: response.data.response.status
                })

                let dataaftersaved = await createPickup.save().then(async (saveddata) => {
                    const headers = {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                      }
            
                    let shipmentidArr = [
                        orderdata.shipment_ref_id
                    ]  ;
                    var data = {
                        shipment_id: shipmentidArr
                    };
                    var config = {
                    method: 'post',
                    url: 'https://apiv2.shiprocket.in/v1/external/manifests/generate',
                    headers: headers,
                    data : data
                    };
                    
                    let secstatus = await axios(config)
                    .then(async function (responsesecond) {
                        if(responsesecond.data.status == 1) {
                            let statusUpdate = await shiprocketPickupModel.updateOne({ _id: saveddata._id }, {$set: { 'manifest_url': responsesecond.data.manifest_url } })
                            .then((updatedData) => {
                                return true;
                            })
                            .catch((err) => {
                                console.log("error updating manifest url"+err)
                                return false;
                            })
                            return statusUpdate;
                        }
                        else {
                            console.log("error status is not 1 for manifest generation")
                            return false;
                        }
                    
                    })
                    .catch((err) => {
                        console.log("could not generate manifest :"+err)
                        return false;
                    })
                    return secstatus;
                })
                .catch((err) => {
                    console.log("error while saving data"+err)
                    return false;
                })
                return dataaftersaved
            }
            else {
                return false;
            }
        })
        .catch(function (error) {
        console.log("error occured while fetching info"+error);
        return false;
        });

        return status;
    }
    else {
        console.log("could not get token");
        return false;
    }
}