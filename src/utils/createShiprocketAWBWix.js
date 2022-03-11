import axios from "axios";
import wixOrderModel from "../models/wix_orders";
import getShipToken from "./GetShiprocketToken";

export default async function (orderdata) {
    const token = await getShipToken();
    if(token != "")
    {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }

        var data = {
            shipment_id: orderdata.shipment_ref_id,
            courier_id: orderdata.courier_id
        };

        var config = {
        method: 'post',
        url: 'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
        headers: headers,
        data : data
        };
        
        let status = await axios(config)
        .then(async function (response) {
            console.log("status from shiprocket"+response.status)
            if(response.data.awb_assign_status == 1) {
                let secondStat = await wixOrderModel.updateOne({'_id': orderdata._id}, { $set: {'shiprocket_awb': response.data.response.data.awb_code} })
                .then((updatedData) => {
                    return "success";
                })
                .catch((err) => {
                    return "failed";
                })
                return secondStat;
            }
            else {
                console.log("assign status is not 1")
                return "failed";
            }
        })
        .catch(function (error) {
        console.log("error occured while fetching info"+error);
        return "failed"
        });
        return status;
    }
    else {
        return "failed";
    }
}