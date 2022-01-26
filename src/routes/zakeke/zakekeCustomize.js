import express from "express";
import zakekeCustomize from "../../Controllers/zakeke/zakekeCustomize";
import customerAuthentication from "../../middleware/CustomerAuthentication";

const router = express.Router()

router.get('/getToken/:id', customerAuthentication, zakekeCustomize.get_token);

router.post('/productinfo', customerAuthentication, zakekeCustomize.getUpdatedPrice)

router.post('/cartUrl', customerAuthentication, zakekeCustomize.getCartURL)

router.post('/editProduct', customerAuthentication, zakekeCustomize.edit_cart)

export default router