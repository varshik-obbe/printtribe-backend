import express from "express";
import CustomerProductsController from "../../Controllers/customers/products";


const router = express.Router()

// router.post('/addCustomer', CustomerAuthentication , CustomerController.add_customer);

// router.post('/login', CustomerController.login);

router.get('/getProducts/:id', CustomerProductsController.get_Products);

// router.get('/getCustomerbyid', CustomerAuthentication, CustomerController.getCustomerById);

// router.patch("/updatecustomer",CustomerAuthentication, CustomerController.updateCustomer);

// router.put("/updatecustomer",CustomerAuthentication, CustomerController.updateCustomer);

// router.delete('/deleteCustomer/:id', CustomerAuthentication, CustomerController.delete_Customer);

export default router