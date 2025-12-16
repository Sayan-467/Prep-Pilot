import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { getQuestions } from '../services/questions';
import { getAnalyticsSummary } from '../services/analytics';
import { getActivities } from '../services/activity';
import { getGoals, createGoal, deleteGoal, toggleGoalCheck } from '../services/goals';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    successRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAllGoalsModal, setShowAllGoalsModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    icon: '🎯',
    targetCount: 10,
    type: 'custom',
    tags: '',
    difficulty: '',
    status: 'done'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [questionsRes, activitiesRes, goalsRes] = await Promise.all([
        getQuestions({ limit: 1000 }),
        getActivities(10, true), // Pass true to get only completed activities
        getGoals()
      ]);

      const questions = questionsRes.data || questionsRes;
      
      // Calculate stats
      const total = questions.length;
      const completed = questions.filter(q => q.status === 'done').length;
      const inProgress = questions.filter(q => q.status === 'in-progress').length;
      const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({ total, completed, inProgress, successRate });
      
      // Format activities - backend now returns formatted data
      const activities = activitiesRes.data || activitiesRes || [];
      const formattedActivities = activities.slice(0, 4).map(act => ({
        question: act.question || 'Unknown Question',
        status: act.status || 'completed',
        time: act.time || 'Recently',
        difficulty: act.difficulty || 'Medium'
      }));
      setRecentActivity(formattedActivities);
      
      setGoals(goalsRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const filters = {};
      if (goalForm.tags) filters.tags = goalForm.tags.split(',').map(t => t.trim());
      if (goalForm.difficulty) filters.difficulty = goalForm.difficulty;
      if (goalForm.status) filters.status = goalForm.status;

      await createGoal({
        title: goalForm.title,
        icon: goalForm.icon,
        targetCount: parseInt(goalForm.targetCount),
        type: goalForm.type,
        filters
      });

      setShowAddGoalModal(false);
      setGoalForm({
        title: '',
        icon: '🎯',
        targetCount: 10,
        type: 'custom',
        tags: '',
        difficulty: '',
        status: 'done'
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await deleteGoal(id);
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  const handleToggleGoal = async (id) => {
    try {
      await toggleGoalCheck(id);
      fetchDashboardData();
    } catch (err) {
      console.error('Error toggling goal:', err);
    }
  };

  const statsData = [
    { label: 'Total Questions', value: stats.total || 0, icon: '📚', color: 'from-blue-500 to-cyan-500', filter: null },
    { label: 'Completed', value: stats.completed || 0, icon: '✅', color: 'from-green-500 to-emerald-500', filter: 'done' },
    { label: 'In Progress', value: stats.inProgress || 0, icon: '⏳', color: 'from-yellow-500 to-orange-500', filter: 'in-progress' },
    { label: 'Success Rate', value: `${stats.successRate || 0}%`, icon: '🎯', color: 'from-purple-500 to-pink-500', filter: null }
  ];

  const handleStatClick = (filter) => {
    if (filter === null) {
      // Navigate to all questions
      navigate('/questions');
    } else {
      // Navigate with status filter
      navigate(`/questions?status=${filter}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-2xl text-gray-600 dark:text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
            <p className="text-lg text-white/90">Ready to crush some coding problems today?</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div
              key={index}
              onClick={() => handleStatClick(stat.filter)}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to bottom right, ${stat.color})` }}></div>
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 transform group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl filter drop-shadow-lg">{stat.icon}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
              </div>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-750 rounded-xl hover:shadow-md transition-all duration-200 border-l-4 border-green-500 group hover:border-indigo-500"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <span className="text-xl font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{activity.question}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                    activity.difficulty === 'Easy' 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                      : activity.difficulty === 'Medium'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                      : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                  }`}>
                    {activity.difficulty}
                  </span>
                </div>
              ))}
            </div>
            {recentActivity.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🎯</span>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No recent activity. Start solving questions!</p>
              </div>
            )}
          </div>

          {/* Goals Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h2>
              </div>
            </div>
            <div className="overflow-y-auto mb-4 pr-2 space-y-4" style={{ maxHeight: '400px' }}>
              {goals.slice(0, 4).map((goal) => {
                const progress = goal.targetCount > 0 
                  ? Math.round((goal.currentCount / goal.targetCount) * 100) 
                  : 0;
                return (
                  <div key={goal._id} className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-750 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-3xl">{goal.icon}</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{goal.title}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full">
                          {goal.currentCount}/{goal.targetCount}
                        </span>
                        <button
                          onClick={() => handleToggleGoal(goal._id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                            goal.completed 
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg' 
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-400 hover:bg-gray-300'
                          }`}
                        >
                          {goal.completed ? '✓' : '○'}
                        </button>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
                        {progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
              {goals.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🎯</span>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No goals set yet. Create your first goal!</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setShowAddGoalModal(true)}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                + New Goal
              </button>
              {goals.length > 0 && (
                <button 
                  onClick={() => setShowAllGoalsModal(true)}
                  className="flex-1 py-2 px-4 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                >
                  View All Goals
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Goal</h3>
              <button
                onClick={() => setShowAddGoalModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Complete 10 Array Problems"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={goalForm.icon}
                    onChange={(e) => setGoalForm({ ...goalForm, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="🎯"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Count *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={goalForm.targetCount}
                    onChange={(e) => setGoalForm({ ...goalForm, targetCount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Type
                </label>
                <select
                  value={goalForm.type}
                  onChange={(e) => setGoalForm({ ...goalForm, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="custom">Custom</option>
                  <option value="tag_specific">Tag Specific</option>
                  <option value="difficulty_specific">Difficulty Specific</option>
                  <option value="weekly_challenge">Weekly Challenge</option>
                </select>
              </div>

              {goalForm.type === 'tag_specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={goalForm.tags}
                    onChange={(e) => setGoalForm({ ...goalForm, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="array, string, dp"
                  />
                </div>
              )}

              {goalForm.type === 'difficulty_specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={goalForm.difficulty}
                    onChange={(e) => setGoalForm({ ...goalForm, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View All Goals Modal */}
      {showAllGoalsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">All Goals</h3>
              <button
                onClick={() => setShowAllGoalsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {goals.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No goals yet. Create your first goal!
                </p>
              ) : (
                goals.map((goal) => {
                  const progress = goal.targetCount > 0 
                    ? Math.round((goal.currentCount / goal.targetCount) * 100) 
                    : 0;
                  return (
                    <div key={goal._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-3xl">{goal.icon}</span>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{goal.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                                {goal.type.replace('_', ' ')}
                              </span>
                              {goal.filters?.difficulty && (
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                                  {goal.filters.difficulty}
                                </span>
                              )}
                              {goal.filters?.tags?.length > 0 && (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                  {goal.filters.tags.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {goal.currentCount}/{goal.targetCount}
                          </span>
                          <button
                            onClick={() => handleToggleGoal(goal._id)}
                            className={`text-2xl ${goal.completed ? 'text-green-600' : 'text-gray-400'}`}
                          >
                            {goal.completed ? '✓' : '○'}
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal._id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xl"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAllGoalsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowAllGoalsModal(false);
                  setShowAddGoalModal(true);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Create New Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
