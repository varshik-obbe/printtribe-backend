import express from "express";
import wixController from "../../Controllers/wix_config/wix_config";
import CustomerAuthentication from "../../middleware/CustomerAuthentication";


const router = express.Router()

router.post('/testToken', CustomerAuthentication , wixController.testToken);

router.post('/appInstalledEvent', wixController.tokenWebhook);

export default router