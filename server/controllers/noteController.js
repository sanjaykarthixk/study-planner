const Note = require('../models/Note');

// GET /api/notes?subjectId=xxx
const getNotes = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.subjectId) filter.subject = req.query.subjectId;

    const notes = await Note.find(filter)
      .populate('subject', 'name color')
      .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/notes
const createNote = async (req, res) => {
  try {
    const { subjectId, title, content } = req.body;
    if (!subjectId || !title)
      return res.status(400).json({ message: 'Subject and title required' });

    const note = await Note.create({
      user: req.user._id,
      subject: subjectId,
      title,
      content: content || '',
    });
    const populated = await note.populate('subject', 'name color');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notes/:id
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('subject', 'name color');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };