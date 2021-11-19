import express from "express";
import ProductsController from "../../Controllers/product/Products";
import Authentication from "../../middleware/Authentication";

const router = express.Router();

router.post('/addProduct', Authentication, ProductsController.add_Products);


router.get('/getProducts', Authentication, ProductsController.get_products);


router.get('/getproduct/:id', Authentication, ProductsController.get_SingleProduct);


router.patch('/updateProduct', Authentication, ProductsController.update_product);

export default router