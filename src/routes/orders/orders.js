import express from "express";
import OrdersController from "../../Controllers/Orders/orders";
import Authentication from "../../middleware/Authentication";
import CustomerAuthentication from "../../middleware/CustomerAuthentication";


const router = express.Router()

router.post('/addOrder', CustomerAuthentication , OrdersController.add_order);

router.get('/getOrders/:id', CustomerAuthentication, OrdersController.getCustomer_orders);

router.get('/getOngoingOrders', Authentication, OrdersController.getAdminOngoingOrders);

router.get('/getCustomerOngoingOrders/:id', CustomerAuthentication, OrdersController.getCustomerOngoing);

router.get('/getCustomerSalesProducts/:month/:year/:quarter/:semester/:week', CustomerAuthentication, OrdersController.getSalesProducts);

router.get('/getCustomerOrdersReport/:month/:year/:quarter/:semester/:week', CustomerAuthentication, OrdersController.getOrdersReport);

router.get('/getAdminOtherOrders', Authentication, OrdersController.getAdminOtherOrders);

export default router