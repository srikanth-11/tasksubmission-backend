const express = require('express');

const Task = require('../models/task')

const router = express.Router();

const authenticate = require('../services/authentication')

router.post('/submittask',authenticate, async(req,res) => {
 try {
  const newTask = new Task({
 title:req.body.title,
 githubUrl:req.body.githuburl,
 deployedUrl:req.body.deployedurl,
 createdAt:new Date().toISOString(),
 username:req.body.username
  })

  const task = await newTask.save()
  res.status(200).json({
   message: "submitted task successfully",
  });
 } catch (error) {
  console.log(error);
  res.status(400).json({
   message: "Error occured",
  });
 }
})

router.put('/updatetask',authenticate, async(req,res) => {
 try {
  const task = await Task.findOne({_id:req.body.id})
  if(task) {
   task.title = req.body.title,
   task.githubUrl=req.body.githuburl,
   task.deployedUrl=req.body.deployedurl,
   task.createdAt=new Date().toISOString()
  }
  await task.save()
  res.status(200).json({
   message: "updated task successfully",
  });
 } catch (error) {
  console.log(error);
  res.status(400).json({
   message: "Error occured",
  });
 }
})

router.get("/gettasks",authenticate,async (req, res) => {
 try {
  const tasks = await Task.find()
  if (tasks) {
   res.status(200).json({
    tasks
   })
  }
  else {
   res.status(400).json({
    message: "there are no tasks"
   })
  }
 } catch (error) {
  console.log(error)
  res.status(400).json({
   message: "Error occured"
  })
 }
})

router.post("/getusertasks", authenticate,async (req, res) => {
 try {
  const tasks = await Task.find({ username: req.body.username })
  if (tasks) {
   res.status(200).json({
    tasks
   })
  }
  else {
   res.status(400).json({
    message: "there are no tasks"
   })
  }
 } catch (error) {
  console.log(error)
  res.status(400).json({
   message: "Error occured"
  })
 }
})

module.exports = router