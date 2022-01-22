import express from "express";
import adminSettingsController from "../../Controllers/admin_settings/admin_settings";
import Authentication from "../../middleware/Authentication";

const router = express.Router();


router.post('/addSetting', Authentication,  adminSettingsController.add_Setting);


router.get('/getAllSettings', Authentication, adminSettingsController.getAll_settings);


router.get('/getSetting/:id', Authentication, adminSettingsController.get_settingById);


router.get("/getSettingByName/:settings_name", Authentication, adminSettingsController.get_settingByName);


router.put('/updateSetting', Authentication, adminSettingsController.update_settingById)


router.delete('/deleteSetting/:id', Authentication, adminSettingsController.delete_setting);

export default router