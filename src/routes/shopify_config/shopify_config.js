import express from "express";
import shopifyController from "../../Controllers/shopify_config/shopify_config";
import CustomerAuthentication from "../../middleware/CustomerAuthentication";


const router = express.Router();

// router.post('/addProducts', CustomerAuthentication, shopifyController.addProduct);
// router.post('/removeProduct', CustomerAuthentication, shopifyController.removeProduct);
 router.post('/customers/data_request', CustomerAuthentication, shopifyController.dataRequest);
 router.post('/customers/redact', CustomerAuthentication, shopifyController.dataDelete);
 router.post('/shop/redact', CustomerAuthentication, shopifyController.shopDelete);

export default router;