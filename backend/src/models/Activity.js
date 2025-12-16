const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  action: { type: String, enum: ['attempted','solved','edited','deleted','created'], required: true },
  status: { type: String, enum: ['attempted', 'completed', 'skipped'], default: 'attempted' },
  metadata: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now }
});

ActivitySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
