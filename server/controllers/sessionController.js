const Session = require('../models/Session');
const Subject = require('../models/Subject');
const User = require('../models/User');

// GET /api/sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .populate('subject', 'name color')
      .sort({ completedAt: -1 })
      .limit(50);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/sessions
const createSession = async (req, res) => {
  try {
    const { subjectId, duration, type } = req.body;

    if (!subjectId || !duration)
      return res.status(400).json({ message: 'Subject and duration required' });

    const session = await Session.create({
      user: req.user._id,
      subject: subjectId,
      duration,
      type: type || 'focus',
    });

    // Update subject completedHours (only for focus sessions)
    if (!type || type === 'focus') {
      await Subject.findByIdAndUpdate(subjectId, {
        $inc: { completedHours: duration / 60 },
      });
    }

    // Update streak
    const user = await User.findById(req.user._id);
    const today = new Date().toDateString();
    const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastStudy !== today) {
      if (lastStudy === yesterday) {
        user.streak += 1;
      } else if (lastStudy !== today) {
        user.streak = 1;
      }
      user.lastStudyDate = new Date();
      await user.save();
    }

    const populated = await session.populate('subject', 'name color');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSessions, createSession };