const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  taskTitle: { type: String, required: true },
  taskDescription: { type: String, required: true },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Task", TaskSchema);
