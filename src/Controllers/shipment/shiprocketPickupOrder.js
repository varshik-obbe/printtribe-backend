import axios from "axios";
import ordersModel from "../../models/orders";
import pickupModel from "../../models/shiprocketPickup";
import wixorderModel from "../../models/wix_orders";
import createAwb from "../../utils/createShiprocketAWB";
import getShipToken from "../../utils/GetShiprocketToken";
import pickupShiprocketOrder from "../../utils/pickupShiprocketOrder";
import thirdpartyOrdersModel from "../../models/thirdparty_orders";


export const assignAWB = async(req,res) => {
    const order_id = req.params.order_id

    await ordersModel.findOne({_id: order_id})
    .exec()
    .then(async (orderdata) => {
        if(orderdata)
        {
            const status = await createAwb(orderdata);
            console.log("status is :"+status)
            if(status == "success") {
                ordersModel.updateOne({ '_id': orderdata._id }, { $set: { 'shipment_status': "awb generated" } })
                .then((updatedData) => {
                    res.status(200).json({ success: {global: "awb generated successfully"} })
                })
                .catch((err) => {
                    console.log("could not update orders status"+err)
                })
            }
            else {
                res.status(500).json({error:{global:"could not generate awb"}});        
            }
        }
        else {
            res.status(500).json({error:{global:"no orders found"}});
        }
    })
    .catch((err) => {
        res.status(500).json({error:{global:"error while fetching data"}});
    })
}


export const generatePickup = async (req,res) => {
    const { pickup_data } = req.body;

    ordersModel.findOne({_id: pickup_data.order_id})
    .exec()
    .then(async (orderdata) => {
        if(orderdata)
        {
            if(orderdata.shiprocket_awb) {
                const pickupData = await pickupShiprocketOrder(orderdata, pickup_data.pickup_date)
                if(pickupData) {
                    ordersModel.updateOne({ '_id': orderdata._id }, { $set: { 'shipment_status': "picking up order" } })
                    .then((updatedData) => {
                        res.status(200).json({ success: { global: "pick up api success" } })
                    })
                    .catch((err) => {
                        console.log("could not update orders status"+err)
                    })
                }
                else {
                    res.status(500).json({error:{global:"something went wrong while pickup API"}});                                    
                }
            }
            else {
                res.status(500).json({error:{global:"awb is not generated yet"}});                
            }
        }
        else {
            res.status(500).json({error:{global:"no orders found"}});
        }
    })
}

export const getPickupDetails = (req,res) => {
    const awbId = req.params.id;

    pickupModel.findOne({ 'shiprocket_awb': awbId })
    .exec()
    .then((saveddata) => {
        res.status(200).json({ saveddata: saveddata })
    })
    .catch((err) => {
        console.log("error occured while fetching"+err)
        res.status(500).json({error:{global:"could not fetch data"}})
    })
}

export const getOrderTrack = async (req,res) => {
    const awbId = req.params.id;

    const token = await getShipToken();
    if(token != "") {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }

        var config = {
        method: 'GET',
        url: 'https://apiv2.shiprocket.in/v1/external/courier/track/awb/'+awbId,
        headers: headers
        };
        
        axios(config)
        .then(async function (response) {
            res.status(200).json({ responseData: response.data })
        })
        .catch((err) => {
            console.log("error is:"+err)
            res.status(500).json({error:{global:"shiprocket get tracking details failed"}});
        })
    }
    else {
        res.status(500).json({error:{global:"failed to get token"}});
    }
}

export const shiprocketWebhookAuth = (req,res) => {
    const data = req.body
    const token = req.get('x-api-key');

    console.log("token value is"+token);
    if(token == "printribesecret") {

        if(data) {
            if(data.current_status == "Delivered") {
                ordersModel.findOne({ 'shiprocket_awb': data.awb })
                .exec()
                .then((Orderdata) => {
                    if(Orderdata) {
                        ordersModel.updateOne({ 'shiprocket_awb': data.awb }, { $set: { 'shipment_status': 'processed' } })
                        .then((data) => {
                            res.status(200).json({ success: { global: "data updated successfully"} })
                        })
                        .catch((err) => {
                            console.log("error updating data from webhook")
                            res.status(200).json({ success: { global: "webhook not accepted"} })
                        })
                    }
                    else {
                        wixorderModel.findOne({ 'shiprocket_awb': data.awb })
                        .exec()
                        .then((wixOrderData) => {
                            if(wixOrderData) {
                                wixorderModel.updateOne({ 'shiprocket_awb': data.awb }, { $set: { 'shipment_status': 'processed' } })
                                .then((updatedWixdata) => {
                                    res.status(200).json({ success: { global: "data updated successfully"} })
                                })
                                .catch((err) => {
                                    console.log("error updating data from webhook")
                                    res.status(200).json({ success: { global: "webhook not accepted"} })
                                })
                            }
                        })
                    }
                })
                .catch((err) => {
                    res.status(200).json({ success: { global: "could not fetch orders Data"} })
                })
            }
            else {
                console.log("status not delivered")
                res.status(200).json({ error: { global: "status is not delivered" } })
            }
        }
        else {
            console.log("no data received")
            res.status(200).json({ error: { global: "no data received" } })
        }
    }
    else {
        res.status(400).json({ error: { global: "token doesn't match" } })
    }
}

export const pickupThirdParty_orders = (req,res) => {
    const order_id = req.params.order_id

    thirdpartyOrdersModel.findOne({_id: order_id})
    .exec()
    .then(async (orderdata) => {
        if(orderdata)
        {
            if(orderdata.shiprocket_awb) {
                const pickupData = await pickupShiprocketOrder(orderdata)
                if(pickupData) {
                    thirdpartyOrdersModel.updateOne({ '_id': orderdata._id }, { $set: { 'shipment_status': "picking up order" } })
                    .then((updatedData) => {
                        res.status(200).json({ success: { global: "pick up api success" } })
                    })
                    .catch((err) => {
                        console.log("could not update orders status"+err)
                    })
                }
                else {
                    res.status(500).json({error:{global:"something went wrong while pickup API"}});                                    
                }
            }
            else {
                res.status(500).json({error:{global:"awb is not generated yet"}});                
            }
        }
        else {
            res.status(500).json({error:{global:"no orders found"}});
        }
    })
}

export default { assignAWB, generatePickup, getPickupDetails, getOrderTrack, shiprocketWebhookAuth, pickupThirdParty_orders }