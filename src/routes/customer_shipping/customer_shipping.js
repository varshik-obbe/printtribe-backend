import express from "express";
import customerShippingController from "../../Controllers/customer_shipping/customer_shipping";
import shiprocketController from "../../Controllers/customer_shipping/shiprocket_couriers";
import Authentication from "../../middleware/Authentication";

const router = express.Router();


router.post('/addShipping', Authentication,  customerShippingController.add_shipping);


router.get('/getShippingById/:id', Authentication, customerShippingController.getSingle_shipping);


router.delete('/deleteShipping/:id', Authentication, customerShippingController.delete_shipping);

router.get('/getShipRocketCharges/:pincode/:weight', Authentication, shiprocketController.get_charges);

export default router