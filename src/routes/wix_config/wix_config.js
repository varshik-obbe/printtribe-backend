import express from "express";
import wixController from "../../Controllers/wix_config/wix_config";
import CustomerAuthentication from "../../middleware/CustomerAuthentication";


const router = express.Router()

router.post('/finishInitialize', CustomerAuthentication , wixController.testToken);

router.post('/appInstalledEvent', wixController.tokenWebhook);

router.post('/addProducts', wixController.addProduct);

router.post('/addMedia', wixController.uploadMedia);

router.post('/uploadQuant', wixController.addQuantity);

router.post('/removeProduct', wixController.removeProd);

router.post('/getOrders', wixController.getOrders);

router.post('/addOrders', wixController.ordersPaid);

router.get('/getWixOrders/:id', CustomerAuthentication, wixController.getWixOrders);

router.get('/getwixAllOrders', CustomerAuthentication, wixController.getAllOrders);

router.post('/setOrderStatus', CustomerAuthentication, wixController.setOrderStatus);

export default router