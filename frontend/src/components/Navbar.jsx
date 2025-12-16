import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useDarkMode } from '../context/DarkModeContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/questions', label: 'Questions', icon: '❓' },
    { path: '/sheets', label: 'Sheets', icon: '📋' },
    { path: '/progress', label: 'Progress', icon: '📈' }
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🎯</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">PrepPilot</h1>
            </button>
            <div className="hidden md:flex space-x-2">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-xl px-4 py-2 border border-indigo-200 dark:border-gray-700">
              <span className="text-2xl">👤</span>
              <span className="text-gray-700 dark:text-white font-semibold">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
