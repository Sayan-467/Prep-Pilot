const Sheet = require('../models/Sheet');
const Question = require('../models/Question');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;

/**
 * Get all sheets for user
 */
exports.getSheets = async (req, res) => {
  try {
    const sheets = await Sheet.find({ userId: req.user.id }).populate('questionIds').sort({ createdAt: -1 });
    
    // Calculate stats for each sheet
    const sheetsWithStats = sheets.map(sheet => {
      const totalQuestions = sheet.questionIds.length;
      const completedQuestions = sheet.questionIds.filter(q => q.status === 'done').length;
      return {
        ...sheet.toObject(),
        totalQuestions,
        completedQuestions
      };
    });
    
    res.json(sheetsWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create sheet
 */
exports.createSheet = async (req, res) => {
  try {
    const { name, description, icon, color, difficulty, questionIds } = req.body;
    const sheet = await Sheet.create({ 
      userId: req.user.id, 
      name, 
      description,
      icon: icon || '📋',
      color: color || 'from-blue-500 to-cyan-500',
      difficulty: difficulty || 'Mixed',
      questionIds: questionIds || [] 
    });
    
    const populated = await Sheet.findById(sheet._id).populate('questionIds');
    const totalQuestions = populated.questionIds.length;
    const completedQuestions = populated.questionIds.filter(q => q.status === 'done').length;
    
    res.status(201).json({
      ...populated.toObject(),
      totalQuestions,
      completedQuestions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSheet = async (req, res) => {
  try {
    const sheet = await Sheet.findOne({ _id: req.params.id, userId: req.user.id }).populate('questionIds');
    if (!sheet) return res.status(404).json({ message: 'Not found' });
    
    const totalQuestions = sheet.questionIds.length;
    const completedQuestions = sheet.questionIds.filter(q => q.status === 'done').length;
    
    res.json({
      ...sheet.toObject(),
      totalQuestions,
      completedQuestions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSheet = async (req, res) => {
  try {
    const sheet = await Sheet.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    ).populate('questionIds');
    
    if (!sheet) return res.status(404).json({ message: 'Not found' });
    
    const totalQuestions = sheet.questionIds.length;
    const completedQuestions = sheet.questionIds.filter(q => q.status === 'done').length;
    
    res.json({
      ...sheet.toObject(),
      totalQuestions,
      completedQuestions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteSheet = async (req, res) => {
  try {
    const sheet = await Sheet.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!sheet) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Sheet deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportSheetCsv = async (req, res) => {
  try {
    const sheet = await Sheet.findOne({ _id: req.params.id, userId: req.user.id }).populate('questionIds');
    if (!sheet) return res.status(404).json({ message: 'Not found' });

    const csvStringifier = createCsvWriter({
      header: [
        { id: 'title', title: 'Title' },
        { id: 'company', title: 'Company' },
        { id: 'difficulty', title: 'Difficulty' },
        { id: 'tags', title: 'Tags' },
        { id: 'status', title: 'Status' },
        { id: 'platformUrl', title: 'URL' }
      ]
    });

    const records = sheet.questionIds.map(q => ({
      title: q.title,
      company: q.company || '',
      difficulty: q.difficulty || '',
      tags: (q.tags || []).join('|'),
      status: q.status,
      platformUrl: q.platformUrl || ''
    }));

    const headerStr = csvStringifier.getHeaderString();
    const body = csvStringifier.stringifyRecords(records);

    res.setHeader('Content-disposition', `attachment; filename=${sheet.name || 'sheet'}.csv`);
    res.set('Content-Type', 'text/csv');
    res.send(headerStr + body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
