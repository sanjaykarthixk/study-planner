const Subject = require('../models/Subject');

// GET /api/subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/subjects
const createSubject = async (req, res) => {
  try {
    const { name, color, targetHours, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Subject name required' });

    const subject = await Subject.create({
      user: req.user._id,
      name, color, targetHours, description,
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    await subject.deleteOne();
    res.json({ message: 'Subject removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };