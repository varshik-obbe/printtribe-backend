import express from "express";
import CategoriesController from "../../Controllers/product/Categories";
import Authentication from "../../middleware/Authentication";

const router = express.Router();

router.post('/addCategories', Authentication, CategoriesController.add_Categories);

router.get('/getCategories', Authentication, CategoriesController.get_Categories);

router.get('/getCategoryById/:id', Authentication, CategoriesController.get_CategoryById);

router.patch('/updateCategorie', Authentication, CategoriesController.update_categories);

router.put('/updateCategorie', Authentication, CategoriesController.update_categories);

router.delete('/deleteCategorie/:id', Authentication, CategoriesController.delete_Category);

export default router;