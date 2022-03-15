import express from "express";
import VendorController from "../../Controllers/vendor/Vendors";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.post('/addVendor', Authentication , VendorController.add_vendor);

router.get('/getVendors', VendorController.getVendors);

router.get('/getVendorsByPage', VendorController.getVendorsByPage);

router.get('/getVendorsById', Authentication, VendorController.getVendorById);

router.put("/updatevendor",Authentication, VendorController.updateVendor);

router.get("/searchVendors/:text", Authentication, VendorController.search_vendors);

router.delete('/deleteVendor/:id', Authentication, VendorController.delete_Vendor);

export default router