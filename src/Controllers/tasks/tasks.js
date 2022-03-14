import mongoose from "mongoose";
import tasksModel from "../../models/tasks";

export const addTasks = (req,res) => {
    const { tasksData } = req.body;

    const saveData = new tasksModel({
        _id: mongoose.Types.ObjectId(),
        stream: tasksData.stream,
        sub_stream: tasksData.sub_stream,
        creator: tasksData.creator,
        creator_id: tasksData.creator_id,
        primary_owner: tasksData.primary_owner,
        primary_owner_id: tasksData.primary_owner_id,
        secondary_owner: tasksData.secondary_owner,
        secondary_owner_id: tasksData.secondary_owner_id,
        tertiary_owner: tasksData.tertiary_owner,
        tertiary_owner_id: tasksData.tertiary_owner_id,
        planned_start_date: tasksData.planned_start_date,
        actual_start_date: "",
        planned_completion_date: "",
        actual_completion_date: "",
        time_taken: "",
        remarks: "",
        status: "ongoing",
        last_status_update: ""
    })

    saveData.save().then((savedData) => {
        res.status(201).json({ data: savedData })
    })
    .catch((err) => {
        console.log("error saving data"+err)
        res.status(400).json({ global: { error: "could not save data" } })
    })
}

export const getAlltasks = (req,res) => {
    tasksModel.find()
    .exec()
    .then((data) => {
        res.status(200).json({ data: data })
    })
    .catch((err) => {
        console.log("error occured while fetching"+err)
        res.status(400).json({ global: { error: "could not fetch data" } })
    })
}

export const getTaskById = (req,res) => {
    const taskId = req.params.id;

    tasksModel.findOne({ '_id': taskId }).exec()
    .then((data) => {
        res.status(200).json({ taskData: data })
    })
    .catch((err) => {
        res.status(400).json({ global: { error: "error occured while fetching" } })
    })
}

export const getTasksByPrimaryOwner = (req,res) => {
    const primary_owner_id = req.params.id;

    tasksModel.find({ 'primary_owner_id': primary_owner_id }).exec()
    .then((data) => {
        res.status(200).json({ taskData: data })
    })
    .catch((err) => {
        res.status(400).json({ global: { error: "error occured while fetching" } })
    })
}

export const getTasksByCreator = (req,res) => {
    const creator_id = req.params.id;

    tasksModel.find({ 'creator_id': creator_id }).exec()
    .then((data) => {
        res.status(200).json({ taskData: data })
    })
    .catch((err) => {
        res.status(400).json({ global: { error: "error occured while fetching" } })
    })
}

export const updateTasks = (req,res) => {
    const id = req.query.id;

    const { tasksData } = req.body;

    tasksModel.updateOne({ '_id': id }, { $set: tasksData })
    .exec().then((updatedData) => {
        res.status(200).json({ global: {success: "updated successfully"} })
    })
    .catch((err) => {
        res.status(400).json({ global: { error: "error occured while updating" } })
    })
}

export const deleteTask = (req,res) => {
    const id = req.params.id;
    tasksModel.deleteOne({_id: id},function(err,data){
        if(err){
            console.log(err);
            res.send('error');
        }
        else
        {
            console.log(data);
            return res.send('success')
        }
    });
}

export default { addTasks, getAlltasks, getTaskById, getTasksByCreator, getTasksByPrimaryOwner, updateTasks, deleteTask }