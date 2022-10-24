import express from "express";
import CustomerController from "../../Controllers/customers/Customer";
import CustomerAuthentication from "../../middleware/CustomerAuthentication";


const router = express.Router()

router.post('/addCustomer', CustomerController.add_customer);

router.post('/verifyMail', CustomerController.verifyMail);

router.post('/customerGoogleSign', CustomerController.google_signinUp);

router.post('/login', CustomerController.login);

router.get('/getCustomers', CustomerController.getCustomers);

router.get('/getCustomerbyid', CustomerAuthentication, CustomerController.getCustomerById);

router.get('/forgotpass/:email', CustomerAuthentication, CustomerController.forgotPassword);

router.get('/tokenVerify/:id', CustomerAuthentication, CustomerController.resetPass);

router.patch("/updatecustomer",CustomerAuthentication, CustomerController.updateCustomer);

router.patch("/updatePass",CustomerAuthentication, CustomerController.updatePass);

router.put("/updatecustomer",CustomerAuthentication, CustomerController.updateCustomer);

router.put("/updatePass",CustomerAuthentication, CustomerController.updatePass);

router.put("/checkupdatePass",CustomerAuthentication, CustomerController.checkUpdPass);

router.delete('/deleteCustomer/:id', CustomerAuthentication, CustomerController.delete_Customer);

export default router