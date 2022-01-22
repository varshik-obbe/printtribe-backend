import express from "express";
import OrdersController from "../../Controllers/Orders/orders";
import CustomerAuthentication from "../../middleware/CustomerAuthentication";


const router = express.Router()

router.post('/addOrder', CustomerAuthentication , OrdersController.add_order);

export default router