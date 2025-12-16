import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useEffect } from 'react';

function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: '📝',
      title: 'Track Questions',
      description: 'Organize and manage all your coding problems in one place with detailed tracking'
    },
    {
      icon: '📊',
      title: 'Progress Analytics',
      description: 'Visualize your progress with comprehensive stats and insights'
    },
    {
      icon: '📋',
      title: 'Custom Sheets',
      description: 'Create custom question sheets for focused practice sessions'
    },
    {
      icon: '🎯',
      title: 'Goal Setting',
      description: 'Set and achieve your coding goals with our goal tracking system'
    },
    {
      icon: '🏆',
      title: 'Performance Metrics',
      description: 'Monitor your success rate, attempts, and time spent on problems'
    },
    {
      icon: '🔥',
      title: 'Stay Consistent',
      description: 'Build streaks and maintain momentum with activity tracking'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer @ Google',
      avatar: '👩‍💻',
      comment: 'PrepPilot helped me organize my interview prep and land my dream job!'
    },
    {
      name: 'Mike Johnson',
      role: 'SDE @ Amazon',
      avatar: '👨‍💼',
      comment: 'The best tool for tracking coding problems. Highly recommended!'
    },
    {
      name: 'Priya Sharma',
      role: 'Developer @ Microsoft',
      avatar: '👩‍🔬',
      comment: 'Game changer for my coding interview preparation journey!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🎯</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PrepPilot
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-6">
              <span className="text-8xl animate-bounce inline-block">🚀</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6">
              Ace Your
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Coding Interviews
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto">
              Track your progress, organize questions, and prepare smarter for technical interviews with PrepPilot
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              >
                Start Free Today 🎉
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white text-indigo-600 text-lg rounded-xl font-bold border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-200 shadow-lg"
              >
                Sign In
              </button>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">1000+</div>
                <div className="text-gray-600 dark:text-gray-400 mt-2">Questions Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">500+</div>
                <div className="text-gray-600 dark:text-gray-400 mt-2">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">95%</div>
                <div className="text-gray-600 dark:text-gray-400 mt-2">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Powerful features to supercharge your interview preparation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-600"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Developers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See what others are saying about PrepPilot
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-4">
                  <span className="text-5xl mr-4">{testimonial.avatar}</span>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.comment}"</p>
                <div className="mt-4 text-yellow-400">⭐⭐⭐⭐⭐</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Level Up Your Interview Prep?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join hundreds of developers preparing smarter with PrepPilot
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-10 py-5 bg-white text-indigo-600 text-xl rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
          >
            Get Started for Free 🚀
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-3xl">🎯</span>
              <span className="text-2xl font-bold">PrepPilot</span>
            </div>
            <div className="text-gray-400">
              © 2025 PrepPilot. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
