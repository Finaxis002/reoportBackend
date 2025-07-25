const express = require("express")
const router = express.Router();
const Notification = require('../models/Notification')

router.get("/admin/notifications", async (req, res) => {
  try {
    // ✅ Filter only admin notifications
    const notifications = await Notification.find({ type: 'admin' })
      .sort({ createdAt: -1 })
      .limit(20); // ✅ Limit to 20 recent notifications

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ✅ GET endpoint for fetching employee notifications
router.get("/notifications/employee", async (req, res) => {
  try {
    const { employeeId, limit = 20, page = 1, read } = req.query;

    if (!employeeId) {
      console.error("❌ Employee ID is required");
      return res.status(400).json({ error: "Employee ID is required" });
    }

    console.log(`🔎 Fetching notifications for employeeId: ${employeeId}`);

    let query = { 
      employeeId, 
      type: 'employee' 
    };

    if (read !== undefined) query.read = read === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalNotifications = await Notification.countDocuments(query);

    console.log("✅ Retrieved Notifications from DB:", notifications);

    res.status(200).json({
      notifications,
      totalNotifications,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalNotifications / limit),
    });
  } catch (err) {
    console.error("❌ Error fetching employee notifications:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET unseen notifications for an employee
router.get("/notifications/unseen", async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const unseenNotifications = await Notification.find({
      employeeId,
      type: "employee",
      read: false,
    }).sort({ createdAt: -1 });

    res.status(200).json(unseenNotifications);
  } catch (err) {
    console.error("❌ Error fetching unseen notifications:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// ✅ PUT to mark all employee notifications as read
router.put("/notifications/mark-seen", async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const result = await Notification.updateMany(
      { employeeId, type: "employee", read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      message: "All unseen notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("❌ Error marking notifications as seen:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router ;