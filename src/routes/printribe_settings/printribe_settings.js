import express from "express";
import printribeSettingsController from "../../Controllers/printribe_settings/printribe_settings";
import Authentication from "../../middleware/Authentication";

const router = express.Router();


router.post('/addSettings', Authentication,  printribeSettingsController.addSettings);


router.get('/getSettings', Authentication, printribeSettingsController.getSettings);


export default router