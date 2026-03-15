const Task = require('../models/Task');

// GET /api/tasks?subjectId=xxx
const getTasks = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.subjectId) filter.subject = req.query.subjectId;

    const tasks = await Task.find(filter)
      .populate('subject', 'name color')
      .sort({ dueDate: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { subjectId, title, dueDate, priority } = req.body;
    if (!subjectId || !title)
      return res.status(400).json({ message: 'Subject and title required' });

    const task = await Task.create({
      user: req.user._id,
      subject: subjectId,
      title, dueDate, priority,
    });
    const populated = await task.populate('subject', 'name color');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('subject', 'name color');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };