const Session = require('../models/Session');
const Subject = require('../models/Subject');
const Task = require('../models/Task');
const User = require('../models/User');

// GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Today's hours
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const todaySessions = await Session.aggregate([
      { $match: { user: userId, type: 'focus', completedAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$duration' } } },
    ]);
    const todayMinutes = todaySessions[0]?.total || 0;

    // This week's hours
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
    const weekSessions = await Session.aggregate([
      { $match: { user: userId, type: 'focus', completedAt: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: '$duration' } } },
    ]);
    const weekMinutes = weekSessions[0]?.total || 0;

    // Hours per day (last 7 days)
    const dailyData = await Session.aggregate([
      { $match: { user: userId, type: 'focus', completedAt: { $gte: weekStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          minutes: { $sum: '$duration' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Hours per subject
    const subjectData = await Session.aggregate([
      { $match: { user: userId, type: 'focus' } },
      { $group: { _id: '$subject', totalMinutes: { $sum: '$duration' } } },
      { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subjectInfo' } },
      { $unwind: '$subjectInfo' },
      { $project: { name: '$subjectInfo.name', color: '$subjectInfo.color', totalMinutes: 1 } },
      { $sort: { totalMinutes: -1 } },
    ]);

    // Subjects with progress
    const subjects = await Subject.find({ user: userId });

    // Task stats
    const totalTasks     = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, isCompleted: true });

    // User streak
    const user = await User.findById(userId);

    res.json({
      todayMinutes,
      weekMinutes,
      streak: user.streak || 0,
      dailyData,
      subjectData,
      subjects,
      taskStats: { total: totalTasks, completed: completedTasks },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSummary };