const express = require("express")
const router = express.Router();
const Task = require('../models/Task')
const Employee = require('../models/employee')


router.post("/", async (req, res) => {
  try {
    const { employeeId, taskTitle, taskDescription, dueDate } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      console.error(`❌ Employee not found with ID: ${employeeId}`);
      return res.status(404).json({ error: "Employee not found" });
    }

    // ✅ Create the task
    const newTask = new Task({
      employeeId,
      taskTitle,
      taskDescription,
      dueDate,
      createdAt: new Date(),
    });

    await newTask.save();

    const formattedDate = moment(newTask.createdAt).format('DD-MM-YYYY'); 

    // ✅ Create an Admin Notification
    const adminNotification = new Notification({
      employeeId,
      taskId: newTask._id,
      message: ` You assigned a new task "${taskTitle}" to ${employee.name} on ${formattedDate}.`,
      employeeName: employee.name,
      type: 'admin',
      createdAt: new Date(),
      read: false,
    });

    await adminNotification.save();

    // ✅ Create an Employee Notification (NEW Change)
    console.log("🚀 Attempting to create Employee Notification...");
    const employeeNotification = new Notification({
      employeeId,
      taskId: newTask._id,
      message: `Task "${taskTitle}" is assigned to you on ${formattedDate}.`,
      employeeName: employee.name,
      type: 'employee', // ✅ Type for employee notification
      createdAt: new Date(),
      read: false,
    });

    console.log("🚀 Created Employee Notification Object:", employeeNotification);

    await employeeNotification.save(); // ✅ SAVE TO DB
    console.log("✅ Employee Notification Created in DB");

//     const io = req.app.get("io"); // 👈 Get socket instance
// io.to(employeeId).emit("new-notification", employeeNotification); // 👈 Emit real-time update

    res.status(201).json({
      message: "Task assigned successfully",
      task: newTask,
    });
  } catch (err) {
    console.error("❌ Error assigning task:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update the route to use a query parameter
router.get("/", async (req, res) => {
  try {
    const { employeeId } = req.query; // Note: now using req.query
    if (!employeeId) {
      return res
        .status(400)
        .json({ error: "employeeId query parameter is required" });
    }
    const tasks = await Task.find({ employeeId });
    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ error: "No tasks found for this employee" });
    }
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT endpoint to update task status
router.put("/:taskId", async (req, res) => {
  try {
    const { status, employeeId } = req.body;
    const { taskId } = req.params;

    // ✅ Update Task Status
    const task = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // ✅ Fetch employeeName from Employee schema using employeeId
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // ✅ If status is changed to Completed – Notify Admin
    if (status === "Completed") {
      const completionNotification = new Notification({
        employeeId,
        taskId: task._id,
        message: `Task "${task.taskTitle}" has been marked as completed by ${employee.name}.`,
        employeeName: employee.name,
        type: 'admin', // ✅ Notify Admin when task is completed
        createdAt: new Date(),
        read: false,
      });

      await completionNotification.save();
//       const io = req.app.get("io");
// io.to(employeeId).emit("new-notification", employeeNotification);

    }

    // ✅ Send Status Update Notification to Employee
    const employeeNotification = new Notification({
      employeeId,
      taskId: task._id,
      message: `Task "${task.taskTitle}" status has been updated to "${status}".`,
      employeeName: employee.name,
      type: 'employee', // ✅ Notify Employee about task status change
      createdAt: new Date(),
      read: false,
    });

    await employeeNotification.save();
    console.log("✅ Employee Notification Saved:", employeeNotification); 
    res.status(200).json({ task });
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
