import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/authContext";
import { DarkModeProvider } from "./context/DarkModeContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Questions from "./pages/Questions";
import Sheets from "./pages/Sheets";
import Progress from "./pages/Progress";
import ProtectedRoute from "./components/ProtectedRoute";
import Chatbot from "./components/Chatbot";

function ChatbotWrapper() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Only show chatbot on protected pages when user is logged in
  const protectedPaths = ['/dashboard', '/questions', '/sheets', '/progress'];
  const showChatbot = user && protectedPaths.includes(location.pathname);
  
  return showChatbot ? <Chatbot /> : null;
}

export default function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/questions"
            element={<ProtectedRoute><Questions /></ProtectedRoute>}
          />
          <Route
            path="/sheets"
            element={<ProtectedRoute><Sheets /></ProtectedRoute>}
          />
          <Route
            path="/progress"
            element={<ProtectedRoute><Progress /></ProtectedRoute>}
          />
        </Routes>
        <ChatbotWrapper />
      </BrowserRouter>
    </AuthProvider>
    </DarkModeProvider>
  );
}
