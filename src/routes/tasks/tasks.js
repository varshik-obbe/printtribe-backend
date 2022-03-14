import express from "express";
import tasksController from "../../Controllers/tasks/tasks";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.post('/addTasks', Authentication, tasksController.addTasks);

router.get('/getAlltasks', Authentication, tasksController.getAlltasks);

router.get('/getTaskById/:id', Authentication, tasksController.getTaskById);

router.get('/getTaskByCreator/:id', Authentication, tasksController.getTasksByCreator);

router.get('/getTasksByPrimary/:id', Authentication, tasksController.getTasksByPrimaryOwner);

router.patch("/updateTask",Authentication, tasksController.updateTasks);

router.put("/updateTask",Authentication, tasksController.updateTasks);

router.delete('/deleteTask/:id', Authentication, tasksController.deleteTask);

export default router