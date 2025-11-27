const mongoose = require("mongoose");

const consultantFormSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  consultantId: { type: String, required: true }, // Add consultantId
  AccountInformation: Object,
  MeansOfFinance: Object,
  CostOfProject: Object,
  ProjectReportSetting: Object,
  Expenses: Object,
  Revenue: Object,
  MoreDetails: Object,
  computedData: {
    type: Object,
    default: {},
  },
});

const ConsultantFormData = mongoose.model("ConsultantFormData", consultantFormSchema, "consultantreports"); // Model with collection name

module.exports = ConsultantFormData; // Export the Model