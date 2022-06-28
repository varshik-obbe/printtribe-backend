import express from "express";
import productQuantController from "../../Controllers/product/Product_quantity";
import Authentication from "../../middleware/Authentication";


const router = express.Router();

router.post('/addQuantity', Authentication, productQuantController.add_quantities);

router.get('/getQuantityByProductId/:id', Authentication, productQuantController.getQuantById);

router.get('/getQuantBySizeColor/:product_id/:size/:color', Authentication, productQuantController.getQuantByColorSize);

router.put('/updateQuantProduct', Authentication, productQuantController.updateProductsQuant);

router.patch('/updateQuantProduct', Authentication, productQuantController.updateProductsQuant);

router.patch('/updateQuantData', Authentication, productQuantController.updateQuant);

router.put('/updateQuantData', Authentication, productQuantController.updateQuant);

router.get('/getAllQuantLogs/:id', Authentication, productQuantController.getAllQuantLogs);

router.delete('/deleteQuantData/:id', Authentication, productQuantController.deleteQuantItem);

export default router;