const { model, Schema } = require("mongoose");

const taskSchema = new Schema({
 title:String,
 githubUrl:String,
 deployedUrl:String,
 createdAt:String,
 username:String,
})

module.exports = model('Task', taskSchema)