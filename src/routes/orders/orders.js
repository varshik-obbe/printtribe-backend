import express from "express";
import OrdersController from "../../Controllers/Orders/orders";
import Authentication from "../../middleware/Authentication";
import CustomerAuthentication from "../../middleware/CustomerAuthentication";


const router = express.Router()

router.post('/addOrder', CustomerAuthentication , OrdersController.add_order);

router.get('/getProductOrder/:id', CustomerAuthentication , OrdersController.getRepeatOrderInfo);

router.post('/orderReturn', CustomerAuthentication , OrdersController.generateCustomerReturn);

router.get('/getOrders/:id', CustomerAuthentication, OrdersController.getCustomer_orders);

router.get('/getCustomerStatement/:id', CustomerAuthentication, OrdersController.getcustomerStatement);

router.get('/getOngoingOrders', Authentication, OrdersController.getAdminOngoingOrders);

router.get('/getThirdPartyOrders', Authentication, OrdersController.getThirdParty_orders);

router.get('/getAdminThirdPartyApprovedOrders', Authentication, OrdersController.getAdminThirdPartyApproved_orders);

router.post('/addThirdpartyOrder', Authentication, OrdersController.addThirdparty_order);

router.post('/setThirdPartyOrderStatus', Authentication, OrdersController.setThirdPartyOrder_Status);

router.get('/getCustomerOngoingOrders/:id', CustomerAuthentication, OrdersController.getCustomerOngoing);

router.get('/getProductsChartReport', CustomerAuthentication, OrdersController.productsChartData);

router.get('/getProductsSubChartReport', CustomerAuthentication, OrdersController.productsSubChartData);

router.get('/getCustomerSalesProducts/:month/:year/:quarter/:semester/:week', CustomerAuthentication, OrdersController.getSalesProducts);

router.get('/getCustomerOrdersReport/:month/:year/:quarter/:semester/:week', CustomerAuthentication, OrdersController.getOrdersReport);

router.get('/getAdminOtherOrders', Authentication, OrdersController.getAdminOtherOrders);

export default router