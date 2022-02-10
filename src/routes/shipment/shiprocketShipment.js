import express from "express";
import shiprocketPickupAwbController from "../../Controllers/shipment/shiprocketPickupOrder";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.get('/generateAwb/:order_id', Authentication, shiprocketPickupAwbController.assignAWB);

router.get("/generateToken/:order_id",Authentication, shiprocketPickupAwbController.generatePickup);

router.get("/getPickupDetails/:id",Authentication, shiprocketPickupAwbController.getPickupDetails);

router.get("/trackOrderShip/:id",Authentication, shiprocketPickupAwbController.getOrderTrack);

export default router