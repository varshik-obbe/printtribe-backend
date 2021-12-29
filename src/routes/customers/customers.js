import express from "express";
import CustomerController from "../../Controllers/customers/Customer";
import CustomerAuthentication from "../../middleware/CustomerAuthentication";


const router = express.Router()

router.post('/addCustomer', CustomerAuthentication , CustomerController.add_customer);

router.post('/login', CustomerController.login);

router.get('/getCustomers', CustomerController.getCustomers);

router.get('/getCustomerbyid', CustomerAuthentication, CustomerController.getCustomerById);

router.patch("/updatecustomer",CustomerAuthentication, CustomerController.updateCustomer);

router.put("/updatecustomer",CustomerAuthentication, CustomerController.updateCustomer);

router.delete('/deleteCustomer/:id', CustomerAuthentication, CustomerController.delete_Customer);

export default router