const express = require('express');
const router = express.Router();
const Consultant = require('../models/Consultant');
const ConsultantFormData = require('../models/consulatantFormData');
const upload = require('../middleware/multerConfig');
const path = require('path');
const fs = require('fs');


router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let consultants;
    let total;

    if (search) {
      consultants = await Consultant.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      
      total = await Consultant.countDocuments({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      });
    } else {
      consultants = await Consultant.find()
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      
      total = await Consultant.countDocuments();
    }

    // Add report count for each consultant
    const consultantsWithCount = await Promise.all(
      consultants.map(async (consultant) => {
        const reportCount = await ConsultantFormData.countDocuments({ consultantId: consultant._id });
        return { ...consultant.toObject(), reportCount };
      })
    );

    res.json({
      consultants: consultantsWithCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching consultants:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const consultant = await Consultant.findById(req.params.id);

    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    res.json(consultant);
  } catch (error) {
    console.error('Error fetching consultant:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Consultant not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.post('/', upload.single('logo'), async (req, res) => {
  try {
    console.log('=== DEBUG INFO ===');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    console.log('Request headers content-type:', req.headers['content-type']);
    
    const { name, mobile, email, address } = req.body;

    // Check if we're getting the form data
    if (!name || !mobile || !email || !address) {
      console.log('Missing fields in req.body:', { name, mobile, email, address });
      return res.status(400).json({ 
        message: 'Missing required fields in form data',
        receivedData: req.body 
      });
    }

    // Check if consultant with email already exists
    const existingConsultant = await Consultant.findOne({ email });
    if (existingConsultant) {
      // If file was uploaded but consultant exists, delete the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Consultant with this email already exists' });
    }

    const consultantData = {
      name,
      mobile,
      email,
      address
    };

    // If logo file was uploaded, add the file path to consultant data
    if (req.file) {
      consultantData.logo = `/uploads/consultants/${req.file.filename}`;
    }

    const consultant = new Consultant(consultantData);
    const savedConsultant = await consultant.save();

    res.status(201).json(savedConsultant);
  } catch (error) {
    // If file was uploaded but error occurred, delete the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error creating consultant:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});;


router.put('/:id', upload.any(), async (req, res) => {
  try {
    const { name, mobile, email, address, removeLogo } = req.body;

    // Find existing consultant
    const existingConsultant = await Consultant.findById(req.params.id);
    if (!existingConsultant) {
      // If file was uploaded but consultant doesn't exist, delete the uploaded file
      if (req.files && req.files.length > 0) {
        fs.unlinkSync(req.files[0].path);
      }
      return res.status(404).json({ message: 'Consultant not found' });
    }

    // Check if email is being changed and if it already exists for another consultant
    if (email && email !== existingConsultant.email) {
      const consultantWithEmail = await Consultant.findOne({
        email,
        _id: { $ne: req.params.id }
      });
      if (consultantWithEmail) {
        // If file was uploaded but email conflict, delete the uploaded file
        if (req.files && req.files.length > 0) {
          fs.unlinkSync(req.files[0].path);
        }
        return res.status(400).json({ message: 'Consultant with this email already exists' });
      }
    }

    const updateData = {
      name,
      mobile,
      email,
      address,
      updatedAt: new Date()
    };

    // Handle logo removal or update
    if (removeLogo === 'true' && (!req.files || req.files.length === 0)) {
      // Remove existing logo
      if (existingConsultant.logo) {
        const oldLogoPath = path.join(__dirname, '..', existingConsultant.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      updateData.logo = null; // Set logo to null in database
    } else if (req.files && req.files.length > 0) {
      // New logo uploaded - delete old one and set new one
      if (existingConsultant.logo) {
        const oldLogoPath = path.join(__dirname, '..', existingConsultant.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      updateData.logo = `/uploads/consultants/${req.files[0].filename}`;
    }
    // If neither removeLogo nor new file, keep existing logo

    const consultant = await Consultant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(consultant);
  } catch (error) {
    // If file was uploaded but error occurred, delete the uploaded file
    if (req.files && req.files.length > 0) {
      fs.unlinkSync(req.files[0].path);
    }
    console.error('Error updating consultant:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Consultant not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid consultant ID' });
    }

    const consultant = await Consultant.findById(id);
    
    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    // Delete logo file if it exists
    if (consultant.logo) {
      const logoPath = path.join(__dirname, '..', consultant.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    // Permanently delete the document
    await Consultant.findByIdAndDelete(id);

    res.json({ message: 'Consultant deleted successfully' });
  } catch (error) {
    console.error('Error deleting consultant:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Consultant not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;