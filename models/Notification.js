const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
