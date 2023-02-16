import express from "express";
import FabricDesignController from "../../Controllers/fabricjs/fabricDesigns";
import Authentication from "../../middleware/Authentication";

const router = express.Router();

router.post('/addDesign', Authentication, FabricDesignController.add_Desing);

router.post('/addSavedDesign', Authentication, FabricDesignController.addSaved_Design);

router.post('/addProductWithDesign', Authentication, FabricDesignController.saveProductWithDesign);

router.get('/getDesigns', Authentication, FabricDesignController.get_FabricDesigns);

router.get('/getProductWithDesign/:id', Authentication, FabricDesignController.getProductWithDesign);

router.get('/getFabricDesign/:id/:color/:side/:customerId', Authentication, FabricDesignController.get_FabricDesignByfilter);

router.get('/getSavedDesign/:id', Authentication, FabricDesignController.getAllsaved_design);

router.get('/getSavedProductDesign/:id', Authentication, FabricDesignController.getAllproductwithDesigns);

export default router;