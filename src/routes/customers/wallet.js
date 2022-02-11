import express from "express";
import walletController from "../../Controllers/customers/Wallet";
import CustomerAuthentication from "../../middleware/CustomerAuthentication";


const router = express.Router()

router.post('/addWalletAmount', CustomerAuthentication , walletController.add_credits);

router.get('/getWalletbyid/:id', CustomerAuthentication, walletController.get_walletByID);

router.post('/razorPayInstantiate', CustomerAuthentication , walletController.instantiateRazorpay);

// router.patch("/updateWallet",CustomerAuthentication, CustomerController.updateCustomer);

// router.put("/updatecustomer",CustomerAuthentication, CustomerController.updateCustomer);

// router.delete('/deleteCustomer/:id', CustomerAuthentication, CustomerController.delete_Customer);

export default router