import express from "express";
import shiprocketPickupAwbController from "../../Controllers/shipment/shiprocketPickupOrder";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.post('/shippingAuth', Authentication, shiprocketPickupAwbController.shiprocketWebhookAuth);

export default router