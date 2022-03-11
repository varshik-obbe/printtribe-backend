import express from "express";
import wixorderpickupController from "../../Controllers/shipment/wixOrdersPickup";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.get('/generateAwb/:order_id', Authentication, wixorderpickupController.assignAWB);

router.get("/generateToken/:order_id",Authentication, wixorderpickupController.generatePickup);

router.get("/getPickupDetails/:id",Authentication, wixorderpickupController.getPickupDetails);

router.get("/trackOrderShip/:id",Authentication, wixorderpickupController.getOrderTrack);

export default router