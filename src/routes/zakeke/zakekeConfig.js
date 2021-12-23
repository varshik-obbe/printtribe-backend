import express from "express";
import ZakekeConfigController from "../../Controllers/zakeke/zakekeConfig";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.post('/addConfig', Authentication , ZakekeConfigController.add_Config);

router.get('/getConfig', ZakekeConfigController.getConfig);

router.put("/updateconfig",Authentication, ZakekeConfigController.updateZakekeConfig);

export default router