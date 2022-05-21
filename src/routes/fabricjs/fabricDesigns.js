import express from "express";
import FabricDesignController from "../../Controllers/fabricjs/fabricDesigns";
import Authentication from "../../middleware/Authentication";

const router = express.Router();

router.post('/addDesign', Authentication, FabricDesignController.add_Desing);

router.get('/getDesigns', Authentication, FabricDesignController.get_FabricDesigns);

router.get('/getFabricDesign/:id/:color/:side', Authentication, FabricDesignController.get_FabricDesignByfilter);

export default router;