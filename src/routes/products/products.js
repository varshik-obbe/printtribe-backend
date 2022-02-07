import express from "express";
import multer from "multer";
import ProductsController from "../../Controllers/product/Products";
import Authentication from "../../middleware/Authentication";

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb){
        cb(null, './uploads/');
    },
    
    filename(req,file,cb){
        cb(null, Date.now() + file.fieldname + file.originalname.replace(/ |'/g,"_"))
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


router.put('/updateProduct', Authentication, upload.fields([ { name: 'cover_img', maxCount: 1 }, { name: 'img', maxCount: 1 }]), ProductsController.update_product)


router.patch('/updateProduct', Authentication, ProductsController.update_product);

router.get('/getSearchProducts/:text', Authentication, ProductsController.search_products);


router.delete('/deleteProduct/:id', Authentication, ProductsController.delete_Products);

export default router