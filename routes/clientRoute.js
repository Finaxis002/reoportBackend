const express = require("express");
const Client = require("../models/clients");
const FormData = require("../models/formdatas");

const router = express.Router();

// ✅ Route to add a new client
router.post("/", async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.status(201).json(newClient);
  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({ message: "Failed to add client", error });
  }
});

// ✅ Route to get all clients
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients); // Sends all clients as response
  } catch (error) {
    console.error("Error getting clients:", error);
    res.status(500).json({ message: "Failed to get clients", error });
  }
});

// ✅ Route to get a single client by ID
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.status(200).json(client);
  } catch (error) {
    console.error("Error getting client:", error);
    res.status(500).json({ message: "Failed to get client", error });
  }
});

// ✅ Route to update client by ID
router.put("/:id", async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // ✅ Returns the updated record
      runValidators: true,
    });
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.status(200).json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ message: "Failed to update client", error });
  }
});

// ✅ Route to delete client by ID
router.delete("/:id", async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ message: "Failed to delete client", error });
  }
});


// Route to get all client names from both Clients and FormDatas




module.exports = router;
