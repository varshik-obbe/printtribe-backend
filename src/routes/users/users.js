import express from "express";
import UserController from "../../Controllers/users/User";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.post('/addUser', Authentication , UserController.add_user);

router.post('/changePass', Authentication, UserController.changePass);

router.post('/sendBulkMail', Authentication, UserController.sendBulkMail);

router.post('/login', UserController.login);

router.get('/getUsers', UserController.getUsers);

router.get('/getUserbyid', Authentication, UserController.getUserById);

router.patch("/updateuser",Authentication, UserController.updateUser);

router.put("/updateuser",Authentication, UserController.updateUser);

router.delete('/deleteUser/:id', Authentication, UserController.delete_User);

export default router