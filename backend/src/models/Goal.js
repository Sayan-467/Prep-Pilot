const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  icon: { 
    type: String, 
    default: '🎯' 
  },
  targetCount: { 
    type: Number, 
    required: true 
  },
  currentCount: { 
    type: Number, 
    default: 0 
  },
  type: { 
    type: String, 
    enum: ['question_count', 'tag_specific', 'difficulty_specific', 'weekly_challenge', 'custom'],
    default: 'custom'
  },
  filters: {
    tags: [String],
    difficulty: String,
    status: String
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

GoalSchema.index({ userId: 1, completed: 1 });

GoalSchema.pre('save', function() {
  this.updatedAt = Date.now();
  if (this.currentCount >= this.targetCount) {
    this.completed = true;
  }
});

module.exports = mongoose.model('Goal', GoalSchema);
