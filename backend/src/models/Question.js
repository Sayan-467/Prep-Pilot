const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  platformUrl: { type: String },
  company: { type: String },
  difficulty: { type: String, enum: ['Easy','Medium','Hard'], default: 'Medium' },
  tags: [{ type: String }],
  status: { type: String, enum: ['todo','in-progress','done'], default: 'todo' },
  timeTaken: { type: Number, default: 0 }, // minutes
  notes: { type: String, default: '' },
  attempts: { type: Number, default: 0 },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Core query indexes
QuestionSchema.index({ userId: 1, updatedAt: -1 });
QuestionSchema.index({ userId: 1, status: 1 });
QuestionSchema.index({ userId: 1, difficulty: 1 });
QuestionSchema.index({ userId: 1, company: 1 });
QuestionSchema.index({ userId: 1, tags: 1 });

// Text search index for title
QuestionSchema.index({ title: "text" });

module.exports = mongoose.model('Question', QuestionSchema);