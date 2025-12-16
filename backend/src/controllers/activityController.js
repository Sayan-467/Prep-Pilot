const Activity = require('../models/Activity');

exports.getActivities = async (req, res) => {
  try {
    const { limit = 100, completed } = req.query;
    const acts = await Activity.find({ userId: req.user.id })
      .populate('questionId', 'title difficulty tags status')
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    
    // Filter and map activities
    let mappedActs = acts
      .filter(act => act.questionId) // Filter out activities with deleted questions
      .map(act => ({
        ...act.toObject(),
        status: act.action === 'solved' ? 'completed' : (act.status || 'attempted'),
        question: act.questionId.title,
        difficulty: act.questionId.difficulty,
        questionStatus: act.questionId.status,
        time: getTimeAgo(act.timestamp)
      }));
    
    // If completed=true query param, only show activities for completed questions
    if (completed === 'true') {
      mappedActs = mappedActs.filter(act => 
        act.questionStatus === 'done' || act.questionStatus === 'completed'
      );
    }
    
    res.json({ data: mappedActs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

function getTimeAgo(timestamp) {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

exports.createActivity = async (req, res) => {
  try {
    const { questionId, action, status, metadata } = req.body;
    
    const activity = await Activity.create({
      userId: req.user.id,
      questionId,
      action,
      status: status || (action === 'solved' ? 'completed' : 'attempted'),
      metadata: metadata || {}
    });
    
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
