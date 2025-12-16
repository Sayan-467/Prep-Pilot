const Question = require('../models/Question');

/**
 * GET /api/analytics/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
 * returns totalSolved, streak (naive), accuracyByTag, weeklyBreakdown
 */
exports.summary = async (req, res) => {
  try {
    const userId = req.user.id;
    const questions = await Question.find({ userId });

    const totalSolved = questions.filter(q => q.status === 'done').length;

    // tag-wise accuracy heuristic: attempts and done
    // accuracyByTag: solvedAttempts / attemptsTotal
    const tagStats = {};
    questions.forEach(q => {
      (q.tags || []).forEach(tag => {
        tagStats[tag] = tagStats[tag] || { attempts: 0, solved: 0, count: 0 };
        tagStats[tag].attempts += (q.attempts || 0);
        if (q.status === 'done') tagStats[tag].solved += 1;
        tagStats[tag].count += 1;
      });
    });

    const accuracyByTag = {};
    Object.keys(tagStats).forEach(t => {
      const s = tagStats[t];
      const acc = s.attempts ? Math.round((s.solved / s.attempts) * 100) : Math.round((s.solved / Math.max(1,s.count)) * 100);
      accuracyByTag[t] = acc; // percent
    });

    // simple streak: count consecutive days with any solved question
    const solvedDates = questions.filter(q => q.status === 'done').map(q => q.updatedAt.toISOString().slice(0,10));
    const uniqueDates = Array.from(new Set(solvedDates)).sort().reverse(); // newest first
    let streak = 0;
    if (uniqueDates.length) {
      const today = new Date();
      let cur = new Date(); // day to check
      for (let i = 0; i < uniqueDates.length; i++) {
        const d = new Date(uniqueDates[i]);
        const diffDays = Math.floor((cur - d) / (1000*60*60*24));
        if (diffDays === 0 || diffDays === streak) { // consecutive
          streak += 1;
          cur = new Date(d);
        } else break;
      }
    }

    res.json({ totalSolved, streak, accuracyByTag });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/analytics/recommendation
 * returns a recommended tag/difficulty and a sample question suggestion (todo)
 */
exports.recommendation = async (req, res) => {
  try {
    const userId = req.user.id;
    const questions = await Question.find({ userId });

    // build tag accuracy: solvedCount / attempts
    const tagStats = {};
    questions.forEach(q => {
      (q.tags || []).forEach(tag => {
        tagStats[tag] = tagStats[tag] || { attempts: 0, solved: 0, count: 0 };
        tagStats[tag].attempts += (q.attempts || 0);
        if (q.status === 'done') tagStats[tag].solved += 1;
        tagStats[tag].count += 1;
      });
    });

    // convert to score: low accuracy & high frequency => higher need
    const tagScores = Object.entries(tagStats).map(([tag, s]) => {
      const accuracy = s.attempts ? (s.solved / s.attempts) : (s.solved / Math.max(1, s.count));
      // score: lower accuracy + higher count => higher score
      const score = (1 - accuracy) * Math.log(1 + s.count);
      return { tag, accuracy, count: s.count, score };
    });

    tagScores.sort((a,b) => b.score - a.score);

    let topTag = tagScores.length ? tagScores[0].tag : null;

    // find a todo question from that tag
    let suggestion = null;
    if (topTag) {
      suggestion = await Question.findOne({ userId, tags: topTag, status: 'todo' }).lean();
      if (!suggestion) {
        // fallback: any todo question
        suggestion = await Question.findOne({ userId, status: 'todo' }).lean();
      }
    } else {
      suggestion = await Question.findOne({ userId, status: 'todo' }).lean();
    }

    res.json({
      suggestion: suggestion ? {
        id: suggestion._id,
        title: suggestion.title,
        tags: suggestion.tags,
        difficulty: suggestion.difficulty,
        reason: topTag ? `Low accuracy on "${topTag}"` : 'General suggestion'
      } : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
