import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getSheets, createSheet, updateSheet, deleteSheet } from '../services/sheets';
import { getQuestions } from '../services/questions';

function Sheets() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewQuestionsModal, setShowViewQuestionsModal] = useState(false);
  const [viewingSheet, setViewingSheet] = useState(null);
  const [editingSheet, setEditingSheet] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📋',
    color: 'from-blue-500 to-cyan-500',
    difficulty: 'Mixed'
  });

  const colorOptions = [
    { label: 'Blue', value: 'from-blue-500 to-cyan-500' },
    { label: 'Purple', value: 'from-purple-500 to-pink-500' },
    { label: 'Green', value: 'from-green-500 to-emerald-500' },
    { label: 'Yellow', value: 'from-yellow-500 to-orange-500' },
    { label: 'Red', value: 'from-red-500 to-pink-500' },
    { label: 'Indigo', value: 'from-indigo-500 to-purple-500' }
  ];

  const iconOptions = ['📋', '🎯', '🧠', '📊', '🌲', '🏗️', '🏆', '💡', '🚀', '⚡'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sheetsData, questionsData] = await Promise.all([
        getSheets(),
        getQuestions({ limit: 1000 })
      ]);
      setSheets(sheetsData);
      setAllQuestions(questionsData.data || questionsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSheet = async (e) => {
    e.preventDefault();
    try {
      await createSheet({
        ...formData,
        questionIds: selectedQuestions
      });
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error creating sheet:', err);
    }
  };

  const handleEditSheet = async (e) => {
    e.preventDefault();
    try {
      await updateSheet(editingSheet._id, {
        ...formData,
        questionIds: selectedQuestions
      });
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error updating sheet:', err);
    }
  };

  const handleDeleteSheet = async (id) => {
    if (window.confirm('Are you sure you want to delete this sheet?')) {
      try {
        await deleteSheet(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting sheet:', err);
      }
    }
  };

  const openEditModal = (sheet) => {
    setEditingSheet(sheet);
    setFormData({
      name: sheet.name,
      description: sheet.description || '',
      icon: sheet.icon || '📋',
      color: sheet.color || 'from-blue-500 to-cyan-500',
      difficulty: sheet.difficulty || 'Mixed'
    });
    setSelectedQuestions(sheet.questionIds.map(q => q._id));
    setShowEditModal(true);
  };

  const openViewQuestionsModal = (sheet) => {
    setViewingSheet(sheet);
    setShowViewQuestionsModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '📋',
      color: 'from-blue-500 to-cyan-500',
      difficulty: 'Mixed'
    });
    setSelectedQuestions([]);
    setEditingSheet(null);
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const getProgress = (completed, total) => {
    return Math.round((completed / total) * 100);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      case 'Mixed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Question Sheets 📋</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Organize and track your practice with custom sheets</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>Create Sheet</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Sheets</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{sheets.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Completed</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {sheets.filter(s => s.totalQuestions > 0 && s.completedQuestions === s.totalQuestions).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {sheets.filter(s => s.completedQuestions > 0 && s.completedQuestions < s.totalQuestions).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Questions</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {sheets.reduce((acc, s) => acc + (s.totalQuestions || 0), 0)}
            </p>
          </div>
        </div>

        {/* Sheets Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading sheets...</p>
          </div>
        ) : sheets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">📋</span>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No sheets yet</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Create your first sheet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sheets.map((sheet) => {
              const progress = getProgress(sheet.completedQuestions, sheet.totalQuestions);
              return (
                <div
                  key={sheet._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group cursor-pointer"
                >
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${sheet.color} p-6 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-5xl">{sheet.icon}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(sheet.difficulty)}`}>
                        {sheet.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {sheet.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {sheet.description}
                    </p>

                    {/* Progress */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${sheet.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{sheet.completedQuestions} completed</span>
                        <span>{sheet.totalQuestions} total</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewQuestionsModal(sheet);
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                      >
                        View Questions
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(sheet);
                        }}
                        className="px-3 py-2 border border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors duration-200 text-lg"
                        title="Edit Sheet"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSheet(sheet._id);
                        }}
                        className="px-3 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-lg"
                        title="Delete Sheet"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Sheet Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {showEditModal ? 'Edit Sheet' : 'Create New Sheet'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={showEditModal ? handleEditSheet : handleAddSheet} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sheet Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Blind 75"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of this sheet"
                    rows="2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {iconOptions.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          className={`text-2xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            formData.icon === icon ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500' : ''
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color Theme
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      {colorOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Questions Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Questions ({selectedQuestions.length} selected)
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {allQuestions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No questions available. Add some questions first!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {allQuestions.map(question => (
                        <label
                          key={question._id}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question._id)}
                            onChange={() => toggleQuestionSelection(question._id)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm text-gray-900 dark:text-white">{question.title}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                              question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {question.difficulty}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  {showEditModal ? 'Update Sheet' : 'Create Sheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Questions Modal */}
      {showViewQuestionsModal && viewingSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${viewingSheet.color} p-6`}>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{viewingSheet.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold">{viewingSheet.name}</h3>
                    <p className="text-white/90 text-sm">{viewingSheet.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewQuestionsModal(false);
                    setViewingSheet(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center space-x-4 mt-4 text-white/90 text-sm">
                <span className={`px-3 py-1 rounded-full ${getDifficultyColor(viewingSheet.difficulty)}`}>
                  {viewingSheet.difficulty}
                </span>
                <span>📊 {viewingSheet.completedQuestions} / {viewingSheet.totalQuestions} completed</span>
                <span>🎯 {getProgress(viewingSheet.completedQuestions, viewingSheet.totalQuestions)}% progress</span>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-6">
              {viewingSheet.questionIds && viewingSheet.questionIds.length > 0 ? (
                <div className="space-y-3">
                  {viewingSheet.questionIds.map((question, index) => (
                    <div
                      key={question._id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <span className="text-lg font-bold text-gray-400 dark:text-gray-500 w-8">
                          {index + 1}.
                        </span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {question.title}
                          </h4>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              question.difficulty === 'Easy' 
                                ? 'bg-green-100 text-green-700'
                                : question.difficulty === 'Medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {question.difficulty}
                            </span>
                            {question.tags && question.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {question.status === 'completed' && (
                          <span className="text-green-600 text-xl">✓</span>
                        )}
                        {question.link && (
                          <a
                            href={question.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                          >
                            Solve
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📝</span>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No questions in this sheet yet</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => {
                  setShowViewQuestionsModal(false);
                  setViewingSheet(null);
                }}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sheets;
