import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getQuestions } from '../services/questions';
import { getActivities } from '../services/activity';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Progress() {
  const [questions, setQuestions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
    completedByDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
    byTag: {},
    completedByTag: {},
    weeklyProgress: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [questionsData, activitiesData] = await Promise.all([
        getQuestions({ limit: 2000 }),
        getActivities(1000)
      ]);
      
      console.log('Raw Questions Response:', questionsData);
      console.log('Raw Activities Response:', activitiesData);
      
      // Handle different response structures
      const allQuestions = Array.isArray(questionsData) 
        ? questionsData 
        : (questionsData.data || []);
      
      const allActivities = Array.isArray(activitiesData) 
        ? activitiesData 
        : (activitiesData.data || []);
      
      console.log('Parsed Questions:', allQuestions.length);
      console.log('Parsed Activities:', allActivities.length);
      
      setQuestions(allQuestions);
      setActivities(allActivities);
      
      calculateStats(allQuestions, allActivities);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Error loading progress data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allQuestions, allActivities) => {
    console.log('Calculating stats with:', { 
      questionsCount: allQuestions.length, 
      activitiesCount: allActivities.length 
    });
    
    // Map 'done' status to 'completed' for compatibility
    const completed = allQuestions.filter(q => q.status === 'done' || q.status === 'completed');
    
    console.log('Completed questions:', completed.length);
    
    // Difficulty stats
    const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
    const completedByDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
    
    allQuestions.forEach(q => {
      if (q.difficulty && byDifficulty.hasOwnProperty(q.difficulty)) {
        byDifficulty[q.difficulty]++;
        if (q.status === 'done' || q.status === 'completed') {
          completedByDifficulty[q.difficulty]++;
        }
      }
    });

    // Tag stats
    const byTag = {};
    const completedByTag = {};
    
    allQuestions.forEach(q => {
      if (q.tags && Array.isArray(q.tags)) {
        q.tags.forEach(tag => {
          byTag[tag] = (byTag[tag] || 0) + 1;
          if (q.status === 'done' || q.status === 'completed') {
            completedByTag[tag] = (completedByTag[tag] || 0) + 1;
          }
        });
      }
    });

    // Weekly progress (last 7 days)
    const weeklyProgress = calculateWeeklyProgress(allActivities);

    const newStats = {
      total: allQuestions.length,
      completed: completed.length,
      byDifficulty,
      completedByDifficulty,
      byTag,
      completedByTag,
      weeklyProgress
    };
    
    console.log('Calculated stats:', newStats);
    setStats(newStats);
  };

  const calculateWeeklyProgress = (activities) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      
      const count = (activities || []).filter(a => {
        if (!a.timestamp) return false;
        const activityDate = new Date(a.timestamp).toISOString().split('T')[0];
        return activityDate === dateStr && (a.status === 'completed' || a.action === 'solved');
      }).length;

      last7Days.push({ day: dayName, count, date: dateStr });
    }

    return last7Days;
  };

  const getProgressPercentage = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'from-green-500 to-emerald-500';
      case 'Medium': return 'from-yellow-500 to-orange-500';
      case 'Hard': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const topTags = Object.entries(stats.byTag)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxWeeklyCount = Math.max(...stats.weeklyProgress.map(d => d.count), 1);
  const hasWeeklyActivity = stats.weeklyProgress.some(d => d.count > 0);

  // Chart.js configuration
  const chartData = {
    labels: stats.weeklyProgress.map(d => d.day),
    datasets: [
      {
        label: 'Questions Solved',
        data: stats.weeklyProgress.map(d => d.count),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(139, 92, 246, 0.9)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: false,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return stats.weeklyProgress[index].date;
          },
          label: (context) => {
            return `${context.parsed.y} question${context.parsed.y !== 1 ? 's' : ''} solved`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#9CA3AF',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: false,
          drawBorder: false
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Progress Tracker 📈</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your coding journey and monitor your improvement</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading progress...</p>
          </div>
        ) : stats.total === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">📊</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Data Yet</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
              Start adding and solving questions to see your progress here!
            </p>
            <button 
              onClick={() => window.location.href = '/questions'}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Questions
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <span>🎯</span>
                <span>Overall Progress</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Questions Solved
                  </span>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {stats.completed} / {stats.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${getProgressPercentage(stats.completed, stats.total)}%` }}
                  >
                    <span className="text-white text-xs font-bold">
                      {getProgressPercentage(stats.completed, stats.total)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <span>📊</span>
                <span>Progress by Difficulty</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Easy', 'Medium', 'Hard'].map((difficulty) => {
                  const total = stats.byDifficulty[difficulty];
                  const completed = stats.completedByDifficulty[difficulty];
                  const percentage = getProgressPercentage(completed, total);
                  
                  return (
                    <div key={difficulty} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {difficulty}
                        </span>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                          {completed} / {total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`bg-gradient-to-r ${getDifficultyColor(difficulty)} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <span>📅</span>
                <span>Last 7 Days Activity</span>
              </h2>
              {hasWeeklyActivity ? (
                <div className="h-80">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📊</span>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No activity in the last 7 days</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Start solving questions to see your progress!</p>
                </div>
              )}
            </div>

            {/* Topic Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <span>🏷️</span>
                <span>Progress by Topic</span>
              </h2>
              <div className="space-y-4">
                {topTags.length > 0 ? (
                  topTags.map(([tag, total]) => {
                    const completed = stats.completedByTag[tag] || 0;
                    const percentage = getProgressPercentage(completed, total);
                    
                    return (
                      <div key={tag} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {tag}
                          </span>
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {completed} / {total} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No topics available yet. Start solving questions!
                  </p>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg p-6 text-white">
                <div className="text-4xl mb-2">📚</div>
                <div className="text-3xl font-bold mb-1">{stats.total}</div>
                <div className="text-blue-100">Total Questions</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-3xl font-bold mb-1">{stats.completed}</div>
                <div className="text-green-100">Completed</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
                <div className="text-4xl mb-2">⏳</div>
                <div className="text-3xl font-bold mb-1">{stats.total - stats.completed}</div>
                <div className="text-yellow-100">Remaining</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-3xl font-bold mb-1">{getProgressPercentage(stats.completed, stats.total)}%</div>
                <div className="text-purple-100">Completion</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Progress;
