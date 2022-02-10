import express from "express";
import OrdersController from "../../Controllers/Orders/orders";
import Authentication from "../../middleware/Authentication";
import CustomerAuthentication from "../../middleware/CustomerAuthentication";


const router = express.Router()

router.post('/addOrder', CustomerAuthentication , OrdersController.add_order);

router.get('/getOrders/:id', CustomerAuthentication, OrdersController.getCustomer_orders);

router.get('/getOngoingOrders', Authentication, OrdersController.getAdminOngoingOrders);

export default router