const express = require("express");
const ConsultantFormData = require("../models/consulatantFormData");
const FormData = require("../models/formdatas");
const upload = require("../middleware/multerConfig");

const router = express.Router();

// Save consultant step
router.post("/save-consultant-step", upload.single("file"), async (req, res) => {
  try {
    console.log("🔹 Incoming Request to /save-consultant-step:", req.body);

    const { sessionId, step, data, consultantId } = req.body;
    let updateData;

    try {
      updateData = data ? JSON.parse(data) : {};
    } catch (jsonError) {
      console.error("🔥 JSON Parsing Error:", jsonError);
      return res.status(400).json({ message: "Invalid JSON data", error: jsonError.message });
    }

    console.log("📌 Parsed Data Before File Processing:", updateData);

    if (!updateData.AccountInformation) {
      updateData.AccountInformation = {};
    }

    if (req.file) {
      console.log("📂 File Uploaded:", req.file);
      updateData.AccountInformation.logoOfBusiness = `/uploads/${req.file.filename}`;
    }

    if (!sessionId || sessionId === "undefined") {
      console.log("🛑 Checking if a consultant report already exists...");

      const existingForm = await ConsultantFormData.findOne({ step: 1, consultantId, ...updateData });

      if (existingForm) {
        console.log("⚠️ Consultant report already exists, using existing sessionId:", existingForm.sessionId);
        return res.status(200).json({
          message: "Consultant report already exists, updating sessionId",
          sessionId: existingForm.sessionId,
          filePath: updateData.AccountInformation.logoOfBusiness || null,
        });
      }

      console.log("🆕 Creating New Consultant Report...");
      const newSessionId = require("uuid").v4();
      const newForm = new ConsultantFormData({ sessionId: newSessionId, consultantId, ...updateData });

      await newForm.save();

      return res.status(201).json({
        message: "New consultant report created successfully",
        sessionId: newSessionId,
        filePath: updateData.AccountInformation.logoOfBusiness || null,
      });
    }

    console.log("🔄 Updating Existing Consultant Report for sessionId:", sessionId);

    const updatedForm = await ConsultantFormData.findOneAndUpdate(
      { sessionId },
      { $set: updateData },
      { new: true, upsert: false }
    );

    if (!updatedForm) {
      console.error("❌ Session ID not found:", sessionId);
      return res.status(404).json({ message: "Session ID not found" });
    }

    console.log("✅ Data Updated Successfully:", updatedForm);
    return res.status(200).json({ message: "Data updated successfully", filePath: updateData.AccountInformation.logoOfBusiness || null });

  } catch (error) {
    console.error("🔥 Error in /save-consultant-step API:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// Create new from existing for consultant
router.post("/create-consultant-new-from-existing", upload.single("file"), async (req, res) => {
  try {
    console.log("🔹 Incoming Request to /create-consultant-new-from-existing:", req.body);

    if (!req.body.data) {
      return res.status(400).json({ message: "Missing data in request body" });
    }

    let newData;
    try {
      newData = JSON.parse(req.body.data);
    } catch (jsonError) {
      console.error("🔥 JSON Parsing Error:", jsonError);
      return res.status(400).json({ message: "Invalid JSON format", error: jsonError.message });
    }

    console.log("📌 Parsed Data Before File Processing:", newData);

    if (!newData.AccountInformation) {
      newData.AccountInformation = {};
    }

    if (req.file) {
      console.log("📂 File Uploaded:", req.file);
      newData.AccountInformation.logoOfBusiness = `/uploads/${req.file.filename}`;
    }

    let sessionToUse = newData.sessionId;

    if (sessionToUse) {
      console.log("🔄 Updating existing document for sessionId:", sessionToUse);

      const updatedForm = await ConsultantFormData.findOneAndUpdate(
        { sessionId: sessionToUse },
        { $set: newData },
        { new: true, upsert: false }
      );

      if (!updatedForm) {
        return res.status(404).json({ message: "Session ID not found" });
      }

      return res.status(200).json({
        message: "Data updated successfully",
        sessionId: sessionToUse,
        filePath: newData.AccountInformation.logoOfBusiness || null,
      });
    }

    const newSessionId = require("uuid").v4();
    console.log("🆕 Creating a New Consultant Report with sessionId:", newSessionId);

    const newForm = new ConsultantFormData({ sessionId: newSessionId, ...newData });

    await newForm.save();
    console.log("✅ New Consultant Document Saved Successfully:", newSessionId);

    return res.status(201).json({
      message: "New consultant report created successfully",
      sessionId: newSessionId,
      filePath: newData.AccountInformation.logoOfBusiness || null,
    });

  } catch (error) {
    console.error("🔥 Error in /create-consultant-new-from-existing API:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// Fetch consultant business data
router.get("/fetch-consultant-business-data", async (req, res) => {
  let { businessName, clientName, consultantId } = req.query;

  if (!businessName?.trim() && !clientName?.trim()) {
    return res.status(400).json({ message: "Either businessName or clientName is required" });
  }

  try {
    let query = { consultantId };

    if (businessName?.trim()) {
      query["AccountInformation.businessName"] = { $regex: businessName.trim(), $options: "i" };
    }

    if (clientName?.trim()) {
      query["AccountInformation.clientName"] = { $regex: clientName.trim(), $options: "i" };
    }

    console.log("🔍 Query Conditions:", query);

    let selectFields = "-__v";
    const businessData = await ConsultantFormData.find(query).select(selectFields).lean();

    console.log("✅ Query Result:", businessData);

    if (!businessData.length) {
      return res.status(404).json({ message: "No records found for the given criteria" });
    }

    return res.status(200).json({ message: "Consultant business data fetched successfully", data: businessData });
  } catch (error) {
    console.error("❌ Error fetching consultant business data:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// Update consultant step
router.post("/update-consultant-step", async (req, res) => {
  const { sessionId, data } = req.body;

  try {
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required for updating." });
    }

    const updatedForm = await ConsultantFormData.findOneAndUpdate(
      { sessionId },
      { $set: data },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Session ID not found. Cannot update." });
    }

    return res.status(200).json({ message: "Consultant data updated successfully." });
  } catch (error) {
    console.error("Error updating consultant form data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get consultant report
router.get("/get-consultant-report", async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (sessionId) {
      console.log(`🔎 Fetching consultant report with sessionId: ${sessionId}`);

      const report = await ConsultantFormData.findOne({ sessionId: String(sessionId) });

      if (!report) {
        console.log(`❌ Consultant report not found for sessionId: ${sessionId}`);
        return res.status(404).json({
          success: false,
          message: "Consultant report not found",
        });
      }

      console.log("✅ Consultant report fetched successfully:", report);
      return res.status(200).json({
        success: true,
        data: report,
      });
    } else {
      console.log("🔎 Fetching all consultant reports...");

      const reports = await ConsultantFormData.find();

      if (!reports.length) {
        console.log("❌ No consultant reports found");
        return res.status(404).json({
          success: false,
          message: "No consultant reports found",
        });
      }

      console.log(`✅ Fetched ${reports.length} consultant reports`);
      return res.status(200).json({
        success: true,
        totalReports: reports.length,
        data: reports,
      });
    }
  } catch (error) {
    console.error("🔥 Error in /get-consultant-report API:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Delete consultant report
router.delete("/delete-consultant-report/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReport = await ConsultantFormData.findByIdAndDelete(id);

    if (!deletedReport) {
      console.log(`❌ Consultant report with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Consultant report not found",
      });
    }

    console.log(`✅ Consultant report with ID ${id} deleted successfully`);
    return res.status(200).json({
      success: true,
      message: "Consultant report deleted successfully",
    });
  } catch (error) {
    console.error("🔥 Error deleting consultant report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete consultant report",
      error: error.message,
    });
  }
});

// Update computed data for consultant
router.put("/save-consultant-computed-data/:reportId", async (req, res) => {
  const { reportId } = req.params;
  const { computedData } = req.body;

  if (!computedData || typeof computedData !== "object") {
    return res.status(400).json({ message: "Missing or invalid computed data" });
  }

  try {
    const report = await ConsultantFormData.findByIdAndUpdate(
      reportId,
      { $set: { computedData } },
      { new: true }
    );

    if (!report) return res.status(404).json({ message: "Consultant report not found" });

    res.status(200).json({ message: "Consultant computed data saved", report });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get all reports (formdata + consultant reports)
router.get("/get-all-reports", async (req, res) => {
  try {
    const { all, consultantId } = req.query;
    let reports = [];

    if (all === 'true') {
      const consultantReports = await ConsultantFormData.find();
      const formReports = await FormData.find();

      reports = [
        ...consultantReports.map(report => ({
          ...report.toObject(),
          type: 'consultant'
        })),
        ...formReports.map(report => ({
          ...report.toObject(),
          type: 'formdata'
        }))
      ];
    } else {
      let query = {};
      if (consultantId) {
        query.consultantId = consultantId;
      }
      const consultantReports = await ConsultantFormData.find(query);
      reports = consultantReports.map(report => ({
        ...report.toObject(),
        type: 'consultant'
      }));
    }

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;