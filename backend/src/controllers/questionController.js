const Question = require('../models/Question');
const Activity = require('../models/Activity');

/**
 * Helper to log activity
 */
async function logActivity(userId, questionId, action, metadata = {}) {
  try {
    const status = action === 'solved' || metadata.status === 'completed' 
      ? 'completed' 
      : 'attempted';
    await Activity.create({ userId, questionId, action, status, metadata });
  } catch (err) {
    console.error('Activity log error', err);
  }
}

exports.createQuestion = async (req, res) => {
  try {
    const userId = req.user.id; // temp fallback for testing
    const payload = { ...req.body, userId };
    const q = await Question.create(payload);
    await logActivity(userId, q._id, 'created', { title: q.title });
    res.status(201).json(q);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const userId = req.user.id;

    // pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 2000);
    const skip = (page - 1) * limit;

    // filters
    const {
      status,
      difficulty,
      tag,
      company,
      search,
      sort = "updatedAt",
      order = "desc"
    } = req.query;

    const filter = { userId };

    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (company) filter.company = company;
    
    // Handle multiple tags (comma-separated)
    if (tag) {
      const tags = tag.split(',').map(t => t.trim()).filter(t => t);
      if (tags.length > 0) {
        filter.tags = { $in: tags };
      }
    }
    
    // Also support 'tags' parameter for multiple tags
    if (req.query.tags) {
      const tags = req.query.tags.split(',').map(t => t.trim()).filter(t => t);
      if (tags.length > 0) {
        filter.tags = { $in: tags };
      }
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // sorting
    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj = search
      ? { score: { $meta: "textScore" } }
      : { [sort]: sortOrder };

    // query
    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(filter)
    ]);

    res.json({
      data: questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const q = await Question.findOne({ _id: req.params.id, userId });
    if (!q) return res.status(404).json({ message: 'Not found' });
    res.json(q);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const oldQuestion = await Question.findOne({ _id: req.params.id, userId });
    
    const q = await Question.findOneAndUpdate(
      { _id: req.params.id, userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!q) return res.status(404).json({ message: 'Not found' });
    
    // Log activity with proper action based on status change
    const action = req.body.status === 'completed' && oldQuestion?.status !== 'completed' 
      ? 'solved' 
      : 'edited';
    await logActivity(userId, q._id, action, { ...req.body, oldStatus: oldQuestion?.status });
    
    res.json(q);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const q = await Question.findOneAndDelete({ _id: req.params.id, userId });
    if (!q) return res.status(404).json({ message: 'Not found' });
    await logActivity(userId, q._id, 'deleted', {});
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
