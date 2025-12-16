const Goal = require('../models/Goal');
const Question = require('../models/Question');

// GET /api/goals - Get all goals for user
exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

    // Update progress for each goal based on actual question data
    const updatedGoals = await Promise.all(goals.map(async (goal) => {
      const query = { userId };
      
      if (goal.type === 'tag_specific' && goal.filters.tags?.length) {
        query.tags = { $in: goal.filters.tags };
      }
      
      if (goal.type === 'difficulty_specific' && goal.filters.difficulty) {
        query.difficulty = goal.filters.difficulty;
      }
      
      if (goal.filters.status) {
        query.status = goal.filters.status;
      } else {
        // Default to counting only completed questions
        query.status = 'done';
      }

      const currentCount = await Question.countDocuments(query);
      
      if (currentCount !== goal.currentCount) {
        goal.currentCount = currentCount;
        await goal.save();
      }

      return goal;
    }));

    res.json(updatedGoals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/goals - Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, icon, targetCount, type, filters } = req.body;

    const goal = new Goal({
      userId,
      title,
      icon: icon || '🎯',
      targetCount,
      type: type || 'custom',
      filters: filters || {},
      currentCount: 0
    });

    // Calculate initial progress
    const query = { userId };
    
    if (type === 'tag_specific' && filters?.tags?.length) {
      query.tags = { $in: filters.tags };
    }
    
    if (type === 'difficulty_specific' && filters?.difficulty) {
      query.difficulty = filters.difficulty;
    }
    
    if (filters?.status) {
      query.status = filters.status;
    } else {
      query.status = 'done';
    }

    const currentCount = await Question.countDocuments(query);
    goal.currentCount = currentCount;

    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/goals/:id - Update a goal
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    Object.assign(goal, updates);
    await goal.save();

    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/goals/:id - Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const goal = await Goal.findOneAndDelete({ _id: id, userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/goals/:id/check - Toggle goal completion manually
exports.toggleGoalCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.completed = !goal.completed;
    await goal.save();

    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
