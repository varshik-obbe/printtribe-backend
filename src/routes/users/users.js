import express from "express";
import UserController from "../../Controllers/users/User";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.post('/addUser', Authentication , UserController.add_user);

router.post('/login', UserController.login);

router.get('/getUsers', UserController.getUsers);

router.get('/getUserbyid', Authentication, UserController.getUserById);

router.patch("/updateuser",Authentication, UserController.updateUser);

export default router