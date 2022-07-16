import express from "express";
import OfflineOrdersController from "../../Controllers/Orders/offline_orders";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.post('/addOrder', Authentication , OfflineOrdersController.add_order);

// router.get('/getOrders/:id', CustomerAuthentication, OrdersController.getCustomer_orders);

router.get('/getOrders/:month/:year', Authentication, OfflineOrdersController.get_orders);

// router.get('/createPdf', Authentication, OfflineOrdersController.create_pdf);

router.get('/getPDFinvoice/:id', Authentication, OfflineOrdersController.getPdfInvoice);

router.get('/getAllPDFinvoices/:month/:year', Authentication, OfflineOrdersController.downloadAllPDF);

// router.get('/getCustomerOngoingOrders/:id', CustomerAuthentication, OrdersController.getCustomerOngoing);

// router.get('/getAdminOtherOrders', Authentication, OrdersController.getAdminOtherOrders);

export default router