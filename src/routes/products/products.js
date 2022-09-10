import express from "express";
import multer from "multer";
import ProductColor_link from "../../Controllers/product/ProductColor_link";
import ProductsController from "../../Controllers/product/Products";
import ProductSizeChart from "../../Controllers/product/ProductSizeChart";
import Authentication from "../../middleware/Authentication";

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb){
        cb(null, './uploads/');
    },
    
    filename(req,file,cb){
        cb(null, Date.now() + file.fieldname + file.originalname.replace(/ |'/g,"_").toLowerCase())
    }
});

const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'|| file.mimetype === 'image/svg'|| file.mimetype === 'image/jpg'|| file.mimetype === 'image/gif'){
       cb(null,true);
    }else{
       cb(null, false);
    }
}

const upload = multer({
    storage,
    limits:{
        fileSize: 1024*1024*5
    },
    fileFIlter:fileFilter
});


router.post('/addProduct', Authentication, upload.fields([ { name: 'cover_img', maxCount: 1 }, { name: 'img', maxCount: 1 }, { name: 'extra_imgs', maxCount: 12 }]), ProductsController.add_Products);


router.get('/getProducts', Authentication, ProductsController.get_products);


router.get('/getproduct/:id', Authentication, ProductsController.get_SingleProduct);


router.put('/updateProduct', Authentication, upload.fields([ { name: 'cover_img', maxCount: 1 }, { name: 'img', maxCount: 1 }, { name: 'extra_imgs', maxCount: 12 }]), ProductsController.update_product)


router.patch('/updateProduct', Authentication, ProductsController.update_product);

router.get('/getSearchProducts/:text', Authentication, ProductsController.search_products);


router.delete('/deleteProduct/:id', Authentication, ProductsController.delete_Products);

router.post('/productcolorAdd', Authentication, ProductColor_link.add_ProductColorLink);

router.get('/getProductColorLink', ProductColor_link.getColorLinkProducts);

router.get("/getProductColorLinkById/:id", Authentication, ProductColor_link.getProductColorLinkById);

router.put("/updateProductColor",Authentication, ProductColor_link.updateProductColorLinks);

router.delete('/deleteProductColor/:id', Authentication, ProductColor_link.deleteProductColorLink);

router.post('/productsizeChartAdd', Authentication, ProductSizeChart.add_ProductSizeChart);

router.get('/getProductsizeChartById/:id', Authentication, ProductSizeChart.getProductSizeChartById);

router.get('/getProductSizeCharts', ProductSizeChart.getSizeChartProducts);

router.put("/updateProductSizeChart",Authentication, ProductSizeChart.updateProductSizeChart);

router.delete('/deleteProductSizeChart/:id', Authentication, ProductSizeChart.deleteProductSizeChart);

export default router