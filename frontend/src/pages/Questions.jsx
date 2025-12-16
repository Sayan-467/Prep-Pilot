import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../services/questions';

function Questions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilterRef = useRef(null);
  
  // Initialize state from URL params
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: parseInt(searchParams.get('page')) || 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterDifficulty, setFilterDifficulty] = useState(searchParams.get('difficulty') || 'all');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');
  const [filterTags, setFilterTags] = useState(
    searchParams.get('tags') ? searchParams.get('tags').split(',') : []
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'recent');
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    platformUrl: '',
    company: '',
    difficulty: 'Easy',
    tags: '',
    status: 'todo',
    attempts: 0,
    notes: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Update URL params whenever filters change
  useEffect(() => {
    const params = {};
    
    if (pagination.page > 1) params.page = pagination.page.toString();
    if (searchTerm) params.search = searchTerm;
    if (filterDifficulty !== 'all') params.difficulty = filterDifficulty;
    if (filterStatus !== 'all') params.status = filterStatus;
    if (filterTags.length > 0) params.tags = filterTags.join(',');
    if (sortBy !== 'recent') params.sortBy = sortBy;
    
    setSearchParams(params, { replace: true });
  }, [pagination.page, searchTerm, filterDifficulty, filterStatus, filterTags, sortBy]);

  useEffect(() => {
    fetchQuestions();
  }, [pagination.page, searchTerm, filterDifficulty, filterStatus, filterTags, sortBy]);

  // Close tag filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagFilterRef.current && !tagFilterRef.current.contains(event.target)) {
        setShowTagFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10
      };

      if (searchTerm) params.search = searchTerm;
      if (filterDifficulty !== 'all') params.difficulty = filterDifficulty;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterTags.length > 0) params.tags = filterTags.join(',');

      // Map sortBy to backend format
      if (sortBy === 'recent') {
        params.sort = 'updatedAt';
        params.order = 'desc';
      } else if (sortBy === 'oldest') {
        params.sort = 'updatedAt';
        params.order = 'asc';
      } else if (sortBy === 'attempts-high') {
        params.sort = 'attempts';
        params.order = 'desc';
      } else if (sortBy === 'attempts-low') {
        params.sort = 'attempts';
        params.order = 'asc';
      }

      const response = await getQuestions(params);
      setQuestions(response.data || response);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const questionData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await createQuestion(questionData);
      await fetchQuestions();
      setShowAddModal(false);
      setFormData({
        title: '',
        platformUrl: '',
        company: '',
        difficulty: 'Easy',
        tags: '',
        status: 'todo',
        attempts: 0,
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      platformUrl: question.platformUrl || '',
      company: question.company || '',
      difficulty: question.difficulty,
      tags: Array.isArray(question.tags) ? question.tags.join(', ') : question.tags || '',
      status: question.status,
      attempts: question.attempts || 0,
      notes: question.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const updatedData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      await updateQuestion(editingQuestion._id, updatedData);
      await fetchQuestions();
      setShowEditModal(false);
      setEditingQuestion(null);
      setFormData({
        title: '',
        platformUrl: '',
        company: '',
        difficulty: 'Easy',
        tags: '',
        status: 'todo',
        attempts: 0,
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await deleteQuestion(id);
      await fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Failed to delete question');
    }
  };

  const handleQuickStatusChange = async (question) => {
    try {
      const statusCycle = {
        'todo': 'in-progress',
        'in-progress': 'done',
        'done': 'todo'
      };
      
      const newStatus = statusCycle[question.status];
      await updateQuestion(question._id, { ...question, status: newStatus });
      await fetchQuestions();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get all unique tags from questions
  const allTags = [...new Set(questions.flatMap(q => q.tags || []))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Questions 🎯</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track and manage your coding problems
                {filterStatus !== 'all' && (
                  <span className="ml-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                    {filterStatus === 'done' ? '✅ Completed' : filterStatus === 'in-progress' ? '⏳ In Progress' : `Status: ${filterStatus}`}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>Add Question</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search questions or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
              <div className="relative" ref={tagFilterRef}>
                <button
                  type="button"
                  onClick={() => setShowTagFilter(!showTagFilter)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left flex items-center justify-between"
                >
                  <span>
                    {filterTags.length === 0 ? 'All Tags' : `${filterTags.length} tag${filterTags.length > 1 ? 's' : ''} selected`}
                  </span>
                  <span className="text-gray-500">▼</span>
                </button>
                {showTagFilter && (
                  <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    <div className="p-2">
                      {filterTags.length > 0 && (
                        <button
                          onClick={() => setFilterTags([])}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-red-600 dark:text-red-400 font-medium"
                        >
                          Clear All
                        </button>
                      )}
                      {allTags.map(tag => (
                        <label
                          key={tag}
                          className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filterTags.includes(tag)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilterTags([...filterTags, tag]);
                              } else {
                                setFilterTags(filterTags.filter(t => t !== tag));
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="attempts-high">Most Attempts</option>
                <option value="attempts-low">Least Attempts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">📝</span>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No questions found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Add your first question
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Attempts
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {questions.map((question) => (
                    <tr key={question._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {question.isFavorite && <span className="text-yellow-400">\u2b50</span>}
                          <span className="font-medium text-gray-900 dark:text-white">{question.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {question.company || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {question.tags?.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-md">
                              {tag}
                            </span>
                          ))}
                          {question.tags?.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                              +{question.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleQuickStatusChange(question)}
                          className={`px-3 py-1 border rounded-full text-xs font-semibold hover:shadow-md transition-all cursor-pointer ${getStatusColor(question.status)}`}
                          title="Click to cycle status: todo → in-progress → done"
                        >
                          {question.status === 'in-progress' ? 'In Progress' : question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {question.attempts}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(question)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(question._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> questions
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {[...Array(pagination.totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      // Show first, last, current, and adjacent pages
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              pagination.page === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === pagination.page - 2 ||
                        pageNum === pagination.page + 2
                      ) {
                        return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Question Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Question</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingQuestion(null);
                      setError('');
                      setFormData({
                        title: '',
                        platformUrl: '',
                        company: '',
                        difficulty: 'Easy',
                        tags: '',
                        status: 'todo',
                        attempts: 0,
                        notes: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                    <p className="text-red-800 dark:text-red-400">{error}</p>
                  </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Two Sum"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Platform URL
                    </label>
                    <input
                      type="url"
                      name="platformUrl"
                      value={formData.platformUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://leetcode.com/problems/..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., Google"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Difficulty *
                      </label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Array, Hash Table, Two Pointers"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Attempts
                      </label>
                      <input
                        type="number"
                        name="attempts"
                        value={formData.attempts}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Add any notes or observations..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      {submitting ? 'Updating...' : 'Update Question'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingQuestion(null);
                        setError('');
                        setFormData({
                          title: '',
                          platformUrl: '',
                          company: '',
                          difficulty: 'Easy',
                          tags: '',
                          status: 'todo',
                          attempts: 0,
                          notes: ''
                        });
                      }}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Question Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Question</h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setError('');
                      setFormData({
                        title: '',
                        platformUrl: '',
                        company: '',
                        difficulty: 'Easy',
                        tags: '',
                        status: 'todo',
                        attempts: 0,
                        notes: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                    <p className="text-red-800 dark:text-red-400">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Two Sum"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Platform URL
                    </label>
                    <input
                      type="url"
                      name="platformUrl"
                      value={formData.platformUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://leetcode.com/problems/..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., Google"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Difficulty *
                      </label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Array, Hash Table, Two Pointers"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Attempts
                      </label>
                      <input
                        type="number"
                        name="attempts"
                        value={formData.attempts}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Add any notes or observations..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      {submitting ? 'Adding...' : 'Add Question'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setError('');
                        setFormData({
                          title: '',
                          platformUrl: '',
                          company: '',
                          difficulty: 'Easy',
                          tags: '',
                          status: 'todo',
                          attempts: 0,
                          notes: ''
                        });
                      }}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Questions;
