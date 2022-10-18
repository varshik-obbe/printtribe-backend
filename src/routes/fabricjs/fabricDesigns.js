import express from "express";
import FabricDesignController from "../../Controllers/fabricjs/fabricDesigns";
import Authentication from "../../middleware/Authentication";

const router = express.Router();

router.post('/addDesign', Authentication, FabricDesignController.add_Desing);

router.post('/addSavedDesign', Authentication, FabricDesignController.addSaved_Design);

router.get('/getDesigns', Authentication, FabricDesignController.get_FabricDesigns);

router.get('/getFabricDesign/:id/:color/:side/:customerId', Authentication, FabricDesignController.get_FabricDesignByfilter);

export default router;