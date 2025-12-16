const mongoose = require('mongoose');

const SheetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '📋' },
  color: { type: String, default: 'from-blue-500 to-cyan-500' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Mixed'], default: 'Mixed' },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  createdAt: { type: Date, default: Date.now }
});

SheetSchema.index({ userId: 1 });

module.exports = mongoose.model('Sheet', SheetSchema);
