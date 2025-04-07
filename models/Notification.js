const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  type: { type: String, enum: ['admin', 'employee'], required: true }, // ✅ Type added to distinguish admin and employee notifications
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  employeeName: { type: String, required: false }, 
  isSeen: {
    type: Boolean,
    default: false
  }
  
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
