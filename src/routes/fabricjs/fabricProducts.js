import express from "express";
import FabricProducts from "../../Controllers/fabricjs/fabricProductsinfo";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.post('/addFabricProducts', Authentication , FabricProducts.add_ProductInfo);

router.get('/getFabricProducts', FabricProducts.getProducts);

router.get("/isFabricProduct/:id", Authentication, FabricProducts.get_isFabricProduct);

router.put("/updateFabricProducts",Authentication, FabricProducts.updateFabricProducts);

router.delete('/deleteFabricProduct/:id', Authentication, FabricProducts.deleteFabricProduct);

export default router