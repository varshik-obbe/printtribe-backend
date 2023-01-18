import express from "express";
import shopifyController from "../../Controllers/shopify_config/shopify_config";
import CustomerAuthentication from "../../middleware/CustomerAuthentication";


const router = express.Router();

router.post('/addProducts', CustomerAuthentication, shopifyController.addProduct);

export default router;