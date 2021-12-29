import express from "express";
import PaymentmethodsController from "../../Controllers/payment_methods/payment_method";
import Authentication from "../../middleware/Authentication";

const router = express.Router();


router.post('/addPaymentMethod', Authentication,  PaymentmethodsController.add_PaymentMethods);


router.get('/getPaymentMethods', Authentication, PaymentmethodsController.get_paymentMethods);


router.get('/getpaymentMethod/:id', Authentication, PaymentmethodsController.get_SinglePaymentMethod);


router.put('/updatePaymentMethod', Authentication, PaymentmethodsController.update_paymentMethod)


router.delete('/deletePaymentMethod/:id', Authentication, PaymentmethodsController.delete_PaymentMethods);

export default router