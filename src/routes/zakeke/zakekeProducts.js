import express from "express";
import ZakekeProducts from "../../Controllers/zakeke/zakekeProductInfo";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.post('/addZakekeProducts', Authentication , ZakekeProducts.add_ProductInfo);

router.get('/getZakekeProducts', ZakekeProducts.getProducts);

router.get("/isZakekeProduct/:id", Authentication, ZakekeProducts.get_isZakekeProduct);

router.put("/updateZakekeProducts",Authentication, ZakekeProducts.updateZakekeProducts);

router.delete('/deleteZakekeProduct/:id', Authentication, ZakekeProducts.deleteZakekeProduct);

export default router