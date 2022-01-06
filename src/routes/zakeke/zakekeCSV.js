import express from "express";
import zakekeCSV from "../../Controllers/zakekeCSV/zakekeCSV";
import Authentication from "../../middleware/Authentication";

const router = express.Router()

router.get('/getZakekeCSV', Authentication, zakekeCSV.get_csv);

export default router